"""共享设施预约的状态流转测试。

每个用例都在 setUp 中自行创建设施/时段，数据在 APITestCase 的事务回滚 +
tearDown 显式清理双重保障下隔离，连续、反复执行结果一致。

覆盖：
1. 取消后时段释放，可被他人重新预约；旧凭证再核销被拒绝
2. 重复核销被拒绝；核销后登记结束、重复结束被拒绝
3. 取消后的凭证核销被拒绝（取消后再核销）
4. 过期未核销自动爽约；爽约凭证再核销被拒绝；对过期预约直接核销返回爽约
"""
from datetime import timedelta

from django.utils import timezone
from rest_framework.test import APITestCase

from app.apps.facility.models import Facility, FacilitySlot, Reservation
from .factories import PROPERTY_HEADERS, booking_payload, create_reservation, make_facility, make_slot


class ReservationLifecycleTests(APITestCase):
    def setUp(self):
        # 每个用例独立准备数据
        self.facility = make_facility('状态测试健身房')
        self.future_slot = make_slot(self.facility, start_dt=timezone.now() + timedelta(days=1))
        self.phone_a = '13800000001'
        self.phone_b = '13900000002'

    def tearDown(self):
        # 显式清理，保证连续/重复执行互不影响
        Reservation.objects.all().delete()
        FacilitySlot.objects.all().delete()
        Facility.objects.all().delete()

    def _book(self, slot=None, phone=None, name='租客'):
        target = slot or self.future_slot
        response = self.client.post(
            '/api/reservations/',
            booking_payload(target, phone=phone or self.phone_a, name=name),
            format='json',
        )
        self.assertEqual(response.status_code, 201, response.data)
        return response.data['data']

    def _slot_view(self, slot):
        response = self.client.get('/api/slots/', {'facilityId': self.facility.id})
        return next(s for s in response.data['data'] if s['id'] == slot.id)

    def test_cancel_releases_slot_for_others(self):
        # A 预约后时段约满
        reservation_a = self._book(phone=self.phone_a, name='租客A')
        self.assertEqual(self._slot_view(self.future_slot)['status'], '已约满')

        # B 同抢被明确告知时段已满
        conflict = self.client.post(
            '/api/reservations/',
            booking_payload(self.future_slot, phone=self.phone_b, name='租客B'),
            format='json',
        )
        self.assertEqual(conflict.status_code, 409)
        self.assertEqual(conflict.data['code'], 'SLOT_FULL')
        self.assertEqual(conflict.data['error'], '该时段已被预约')

        # A 取消
        cancel = self.client.post(
            f"/api/reservations/{reservation_a['id']}/cancel/",
            {'tenantPhone': self.phone_a},
            format='json',
        )
        self.assertEqual(cancel.status_code, 200)
        self.assertEqual(cancel.data['data']['status'], '已取消')
        self.assertIsNotNone(cancel.data['data']['cancelledAt'])

        # 时段重新可约，B 成功预约（取消后释放）
        self.assertEqual(self._slot_view(self.future_slot)['status'], '可预约')
        reservation_b = self._book(phone=self.phone_b, name='租客B')
        self.assertEqual(reservation_b['status'], '待核销')
        self.assertEqual(self._slot_view(self.future_slot)['status'], '已约满')

        # A 的旧凭证已取消，不能再核销（取消后核销）
        stale = self.client.post(
            '/api/check-in/',
            {'voucherCode': reservation_a['voucherCode']},
            format='json',
            **PROPERTY_HEADERS,
        )
        self.assertEqual(stale.status_code, 409)
        self.assertEqual(stale.data['code'], 'RESERVATION_CANCELLED')

        # 有效预约仍只有 B 一条
        active = Reservation.objects.filter(
            slot=self.future_slot, status__in=['待核销', '已核销']
        )
        self.assertEqual(active.count(), 1)
        self.assertEqual(active.first().tenant_phone, self.phone_b)

    def test_duplicate_check_in_rejected_and_finish_recorded(self):
        # 把时段挪到开场前 10 分钟的可核销窗口
        self.future_slot.start_dt = timezone.now() + timedelta(minutes=10)
        self.future_slot.end_dt = self.future_slot.start_dt + timedelta(hours=1)
        self.future_slot.save()
        reservation = self._book()
        voucher = reservation['voucherCode']

        first = self.client.post('/api/check-in/', {'voucherCode': voucher}, format='json', **PROPERTY_HEADERS)
        self.assertEqual(first.status_code, 200, first.data)
        self.assertEqual(first.data['data']['status'], '已核销')
        self.assertIsNotNone(first.data['data']['checkedInAt'])

        # 重复核销必须被明确拒绝
        second = self.client.post('/api/check-in/', {'voucherCode': voucher}, format='json', **PROPERTY_HEADERS)
        self.assertEqual(second.status_code, 409)
        self.assertEqual(second.data['code'], 'VOUCHER_ALREADY_USED')

        # 状态仍是已核销，核销时间没有被覆盖
        stored = Reservation.objects.get(voucher_code=voucher)
        self.assertEqual(stored.status, '已核销')

        # 登记使用结束并记录结束时间
        finish = self.client.post('/api/finish-use/', {'voucherCode': voucher}, format='json', **PROPERTY_HEADERS)
        self.assertEqual(finish.status_code, 200)
        self.assertEqual(finish.data['data']['status'], '已完成')
        self.assertIsNotNone(finish.data['data']['finishedAt'])

        # 重复结束被拒绝
        finish_again = self.client.post('/api/finish-use/', {'voucherCode': voucher}, format='json', **PROPERTY_HEADERS)
        self.assertEqual(finish_again.status_code, 409)
        self.assertEqual(finish_again.data['code'], 'RESERVATION_ALREADY_FINISHED')

        # 已完成的凭证再核销同样拒绝
        check_after_finish = self.client.post(
            '/api/check-in/', {'voucherCode': voucher}, format='json', **PROPERTY_HEADERS
        )
        self.assertEqual(check_after_finish.status_code, 409)
        self.assertEqual(check_after_finish.data['code'], 'VOUCHER_ALREADY_USED')

    def test_check_in_after_cancel_rejected(self):
        reservation = self._book()
        self.client.post(
            f"/api/reservations/{reservation['id']}/cancel/",
            {'tenantPhone': self.phone_a},
            format='json',
        )
        response = self.client.post(
            '/api/check-in/',
            {'voucherCode': reservation['voucherCode']},
            format='json',
            **PROPERTY_HEADERS,
        )
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data['code'], 'RESERVATION_CANCELLED')
        self.assertEqual(response.data['error'], '预约已取消，无法核销')

    def test_expired_reservation_auto_no_show_then_checkin_rejected(self):
        # 一条已结束时段上的待核销预约
        past_slot = make_slot(
            self.facility,
            start_dt=timezone.now() - timedelta(hours=2),
            end_dt=timezone.now() - timedelta(hours=1),
        )
        # 过期时段无法再走预约接口，直接落库一条"待核销"预约模拟爽约场景
        obj = create_reservation(past_slot, phone='13500000005', name='迟到的租客')
        reservation = {'id': obj.id, 'voucherCode': obj.voucher_code}

        # 查询时自动批量爽约
        listing = self.client.get('/api/reservations/', {'tenantPhone': '13500000005'})
        self.assertEqual(listing.status_code, 200)
        row = next(r for r in listing.data['data'] if r['id'] == reservation['id'])
        self.assertEqual(row['status'], '爽约')
        self.assertIsNotNone(row['noShowAt'])

        # 爽约凭证再核销被明确拒绝
        response = self.client.post(
            '/api/check-in/',
            {'voucherCode': reservation['voucherCode']},
            format='json',
            **PROPERTY_HEADERS,
        )
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data['code'], 'RESERVATION_NO_SHOW')

    def test_direct_checkin_of_expired_pending_marks_no_show(self):
        # 不经过查询，直接对过期待核销凭证核销：应自动爽约并返回冲突
        past_slot = make_slot(
            self.facility,
            start_dt=timezone.now() - timedelta(minutes=90),
            end_dt=timezone.now() - timedelta(minutes=30),
        )
        obj = create_reservation(past_slot, phone='13400000004')
        reservation = {'id': obj.id, 'voucherCode': obj.voucher_code}

        response = self.client.post(
            '/api/check-in/',
            {'voucherCode': reservation['voucherCode']},
            format='json',
            **PROPERTY_HEADERS,
        )
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data['code'], 'RESERVATION_NO_SHOW')
        stored = Reservation.objects.get(voucher_code=reservation['voucherCode'])
        self.assertEqual(stored.status, '爽约')
        self.assertIsNotNone(stored.no_show_at)
