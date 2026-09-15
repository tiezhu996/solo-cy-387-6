import threading
from datetime import timedelta

from django.db import connections
from django.utils import timezone
from django.test import TransactionTestCase

from app.apps.facility.models import Reservation
from app.apps.facility.services import reservation_service
from app.utils.errors import ApiError
from .factories import make_facility, make_slot

CONCURRENT_REQUESTS = 8


class ConcurrentBookingTests(TransactionTestCase):
    """同一设施同一时段并发提交：只保留一个有效预约，其余请求全部收到明确的 SLOT_FULL。

    使用 TransactionTestCase（每个用例真实提交并清空表）+ 文件型 SQLite
    （IMMEDIATE 事务），多线程同时提交；PostgreSQL 下行为一致（行锁串行化）。
    """

    reset_sequences = True

    def _race(self, slot, phone_prefix=1380000):
        barrier = threading.Barrier(CONCURRENT_REQUESTS)
        outcomes: list[tuple[str, str]] = []
        outcomes_lock = threading.Lock()

        def attempt(idx):
            barrier.wait()
            phone = f'{phone_prefix}{idx:05d}'
            try:
                reservation = reservation_service.create_reservation(
                    slot_id=slot.id, tenant_name=f'租客{idx}', tenant_phone=phone
                )
                result = ('ok', reservation.voucher_code)
            except ApiError as exc:
                result = ('full', exc.code)
            except Exception as exc:  # noqa: BLE001
                result = ('error', type(exc).__name__)
            finally:
                connections.close_all()
            with outcomes_lock:
                outcomes.append(result)

        threads = [threading.Thread(target=attempt, args=(i,)) for i in range(CONCURRENT_REQUESTS)]
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join(timeout=60)
        return outcomes

    def test_parallel_submissions_keep_single_active_reservation(self):
        facility = make_facility('游泳馆')
        slot = make_slot(facility, start_dt=timezone.now() + timedelta(days=2), hours=1)

        outcomes = self._race(slot)

        self.assertEqual(len(outcomes), CONCURRENT_REQUESTS)
        winners = [code for kind, code in outcomes if kind == 'ok']
        losers = [code for kind, code in outcomes if kind == 'full']
        errors = [(kind, code) for kind, code in outcomes if kind == 'error']

        # 恰好一个成功
        self.assertEqual(len(winners), 1, f'应有且仅有一个预约成功，实际：{outcomes}')
        # 其余全部收到"时段已满"的明确业务结果，不允许出现数据库锁错误
        self.assertEqual(len(losers), CONCURRENT_REQUESTS - 1, f'失败者应全部收到 SLOT_FULL：{outcomes}')
        self.assertEqual(errors, [], f'不应出现数据库层错误：{outcomes}')
        self.assertTrue(all(code == 'SLOT_FULL' for code in losers))

        # 数据库中同一时段确实只有一个有效预约
        active = Reservation.objects.filter(slot=slot, status__in=['待核销', '已核销'])
        self.assertEqual(active.count(), 1)

    def test_repeated_runs_produce_same_result(self):
        """同样的并发竞态连续执行两次，结果保持一致（每次用独立设施/时段）。"""
        for run in range(2):
            facility = make_facility(f'羽毛球馆{run}')
            slot = make_slot(facility, start_dt=timezone.now() + timedelta(days=3 + run), hours=1)
            outcomes = self._race(slot, phone_prefix=1390000 + run)
            self.assertEqual(sum(kind == 'ok' for kind, _ in outcomes), 1, outcomes)
            self.assertTrue(
                all(kind == 'full' and code == 'SLOT_FULL' for kind, code in outcomes if kind != 'ok'),
                outcomes,
            )
            self.assertEqual(
                Reservation.objects.filter(slot=slot, status__in=['待核销', '已核销']).count(), 1
            )

    def test_cancelled_slot_can_be_won_by_next_race(self):
        """取消后时段释放，新一轮并发抢约仍然只产生一个成功预约。"""
        facility = make_facility('台球厅')
        slot = make_slot(facility, start_dt=timezone.now() + timedelta(days=4), hours=1)

        first = reservation_service.create_reservation(
            slot_id=slot.id, tenant_name='原租客', tenant_phone='13700000000'
        )
        reservation_service.cancel_reservation(first.id)
        self.assertEqual(
            Reservation.objects.filter(slot=slot, status__in=['待核销', '已核销']).count(), 0
        )

        outcomes = self._race(slot, phone_prefix=1360000)
        self.assertEqual(sum(kind == 'ok' for kind, _ in outcomes), 1, outcomes)
        self.assertTrue(
            all(code == 'SLOT_FULL' for kind, code in outcomes if kind == 'full'),
            outcomes,
        )
        self.assertEqual(
            Reservation.objects.filter(slot=slot, status__in=['待核销', '已核销']).count(), 1
        )
