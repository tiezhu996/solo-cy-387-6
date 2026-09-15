import threading
from datetime import timedelta

from django.db import connections
from django.utils import timezone
from django.test import TransactionTestCase

from app.apps.facility.models import Reservation
from app.apps.facility.services import reservation_service
from app.utils.errors import ApiError
from .factories import make_facility, make_slot


class ConcurrentBookingTests(TransactionTestCase):
    """同一设施同一时段并发提交，最多一个成功（数据库约束兜底）。"""

    reset_sequences = True

    def test_parallel_submissions_only_one_succeeds(self):
        facility = make_facility('游泳馆')
        slot = make_slot(facility, start_dt=timezone.now() + timedelta(days=2), hours=1)

        barrier = threading.Barrier(5)
        results = []

        def attempt(phone):
            barrier.wait()
            try:
                reservation = reservation_service.create_reservation(
                    slot_id=slot.id, tenant_name=f'租客{phone}', tenant_phone=phone
                )
                results.append(('ok', reservation.voucher_code))
            except ApiError as exc:
                # PostgreSQL：等待行锁后发现时段已占，返回明确冲突错误
                results.append(('conflict', exc.code))
            except Exception as exc:  # noqa: BLE001
                # SQLite 文件库极端情况下可能直接抛锁错误，同样属于"未成功者"
                results.append(('busy', type(exc).__name__))
            finally:
                connections.close_all()

        threads = [threading.Thread(target=attempt, args=(f'1380000{i:05d}',)) for i in range(5)]
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join(timeout=60)

        self.assertEqual(len(results), 5)
        successes = [r for r in results if r[0] == 'ok']
        failures = [r for r in results if r[0] != 'ok']
        self.assertEqual(len(successes), 1, f'应只有一个预约成功，实际：{results}')
        self.assertEqual(len(failures), 4)
        # 失败要么是明确冲突，要么是 SQLite 本地库锁竞争，绝不能出现两个成功
        self.assertTrue(
            all(code == 'SLOT_FULL' or kind == 'busy' for kind, code in failures),
            f'出现非预期失败：{results}',
        )
        self.assertEqual(
            Reservation.objects.filter(slot=slot, status__in=['待核销', '已核销']).count(), 1
        )
