from datetime import timedelta

from django.utils import timezone
from rest_framework.test import APITestCase

from .factories import (
    PROPERTY_HEADERS,
    booking_payload,
    create_reservation,
    make_facility,
    make_slot,
)


class ReservationFlowTests(APITestCase):
    def setUp(self):
        self.facility = make_facility()
        self.slot = make_slot(self.facility)

    def _book_slot(self, slot, phone='13800000001', name='张三'):
        response = self.client.post('/api/reservations/', booking_payload(slot, phone=phone, name=name), format='json')
        self.assertEqual(response.status_code, 201, response.data)
        return response.data['data']

    def _book(self, phone='13800000001'):
        return self._book_slot(self.slot, phone=phone)

    def test_facilities_and_slots_seed_persisted(self):
        response = self.client.get('/api/facilities/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])

        response = self.client.get('/api/slots/', {'facilityId': self.facility.id})
        self.assertEqual(response.status_code, 200)
        slot_data = response.data['data'][0]
        self.assertEqual(slot_data['status'], '可预约')
        self.assertFalse(slot_data['booked'])

    def test_book_then_slot_becomes_full(self):
        reservation = self._book()
        self.assertEqual(reservation['status'], '待核销')
        self.assertTrue(reservation['voucherCode'])

        response = self.client.get('/api/slots/', {'facilityId': self.facility.id})
        slot_data = next(s for s in response.data['data'] if s['id'] == self.slot.id)
        self.assertEqual(slot_data['status'], '已约满')
        self.assertTrue(slot_data['booked'])

    def test_duplicate_submit_second_fails_with_conflict(self):
        self._book()
        response = self.client.post('/api/reservations/', booking_payload(self.slot, phone='13900000002'), format='json')
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data['code'], 'SLOT_FULL')

    def test_book_nonexistent_slot_returns_404(self):
        payload = booking_payload(self.slot)
        payload['slotId'] = 999999
        response = self.client.post('/api/reservations/', payload, format='json')
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data['code'], 'SLOT_NOT_FOUND')

    def test_book_closed_facility_rejected(self):
        self.facility.status = '停用'
        self.facility.save()
        response = self.client.post('/api/reservations/', booking_payload(self.slot), format='json')
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data['code'], 'SLOT_CLOSED')

    def test_disabled_facility_slots_hidden_and_restored(self):
        """停用设施的时段不出现在可预约列表/筛选项，恢复开放后重新出现。"""
        response = self.client.get('/api/slots/')
        self.assertTrue(any(s['id'] == self.slot.id for s in response.data['data']))

        # 设施列表（租客视角，不含停用设施）
        response = self.client.get('/api/facilities/', {'includeClosed': 'false'})
        self.assertTrue(any(f['id'] == self.facility.id for f in response.data['data']))

        # 物业停用
        response = self.client.patch(
            f'/api/facilities/{self.facility.id}/', {'status': '停用'}, format='json', **PROPERTY_HEADERS
        )
        self.assertEqual(response.status_code, 200)

        # 可预约列表中不再出现该时段（即使显式按该设施过滤）
        response = self.client.get('/api/slots/')
        self.assertFalse(any(s['id'] == self.slot.id for s in response.data['data']))
        response = self.client.get('/api/slots/', {'facilityId': self.facility.id})
        self.assertFalse(any(s['id'] == self.slot.id for s in response.data['data']))
        # 租客视角的设施列表/筛选项也不再包含
        response = self.client.get('/api/facilities/', {'includeClosed': 'false'})
        self.assertFalse(any(f['id'] == self.facility.id for f in response.data['data']))

        # 物业维护视图带 includeDisabled 仍能看到（需物业角色）
        response = self.client.get(
            '/api/slots/', {'includeDisabled': 'true', 'facilityId': self.facility.id}, **PROPERTY_HEADERS
        )
        self.assertTrue(any(s['id'] == self.slot.id for s in response.data['data']))

        # 恢复开放后重新出现
        response = self.client.patch(
            f'/api/facilities/{self.facility.id}/', {'status': '开放'}, format='json', **PROPERTY_HEADERS
        )
        self.assertEqual(response.status_code, 200)
        response = self.client.get('/api/slots/')
        self.assertTrue(any(s['id'] == self.slot.id for s in response.data['data']))

    def test_disabled_facility_existing_reservation_still_manageable(self):
        """停用设施前已有预约：查询、取消仍可用。"""
        reservation = self._book()
        self.client.patch(
            f'/api/facilities/{self.facility.id}/', {'status': '停用'}, format='json', **PROPERTY_HEADERS
        )

        # 租客仍能查到预约并取消
        response = self.client.get('/api/reservations/', {'tenantPhone': '13800000001'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data'][0]['voucherCode'], reservation['voucherCode'])
        response = self.client.post(
            f"/api/reservations/{reservation['id']}/cancel/",
            {'tenantPhone': '13800000001'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data']['status'], '已取消')

    def test_disabled_facility_existing_checkin_still_works(self):
        """停用设施前已到场核销的预约，使用结束登记不受影响。"""
        self.slot.start_dt = timezone.now() + timedelta(minutes=10)
        self.slot.end_dt = self.slot.start_dt + timedelta(hours=1)
        self.slot.save()
        reservation = self._book()
        self.client.patch(
            f'/api/facilities/{self.facility.id}/', {'status': '停用'}, format='json', **PROPERTY_HEADERS
        )

        response = self.client.post(
            '/api/check-in/', {'voucherCode': reservation['voucherCode']}, format='json', **PROPERTY_HEADERS
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data['data']['status'], '已核销')
        response = self.client.post(
            '/api/finish-use/', {'voucherCode': reservation['voucherCode']}, format='json', **PROPERTY_HEADERS
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data']['status'], '已完成')

    def test_cancel_then_slot_can_be_booked_again(self):
        reservation = self._book()
        response = self.client.post(
            f"/api/reservations/{reservation['id']}/cancel/",
            {'tenantPhone': '13800000001'},
            format='json',
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data['data']['status'], '已取消')

        # 时段重新可约，他人可以成功预约
        response = self.client.post('/api/reservations/', booking_payload(self.slot, phone='13700000003'), format='json')
        self.assertEqual(response.status_code, 201, response.data)

    def test_check_in_full_flow_and_duplicate_rejected(self):
        # 调整时段为开场前 10 分钟，处于可核销窗口
        self.slot.start_dt = timezone.now() + timedelta(minutes=10)
        self.slot.end_dt = self.slot.start_dt + timedelta(hours=2)
        self.slot.save()
        reservation = self._book()
        voucher = reservation['voucherCode']

        response = self.client.post('/api/check-in/', {'voucherCode': voucher}, format='json', **PROPERTY_HEADERS)
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data['data']['status'], '已核销')
        self.assertIsNotNone(response.data['data']['checkedInAt'])

        # 重复核销必须报错
        response = self.client.post('/api/check-in/', {'voucherCode': voucher}, format='json', **PROPERTY_HEADERS)
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data['code'], 'VOUCHER_ALREADY_USED')

    def test_check_in_nonexistent_voucher(self):
        response = self.client.post('/api/check-in/', {'voucherCode': 'NOTEXIST000'}, format='json', **PROPERTY_HEADERS)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data['code'], 'VOUCHER_NOT_FOUND')

    def test_check_in_cancelled_reservation_rejected(self):
        reservation = self._book()
        self.client.post(
            f"/api/reservations/{reservation['id']}/cancel/",
            {'tenantPhone': '13800000001'},
            format='json',
        )
        response = self.client.post(
            '/api/check-in/', {'voucherCode': reservation['voucherCode']}, format='json', **PROPERTY_HEADERS
        )
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data['code'], 'RESERVATION_CANCELLED')

    def test_check_in_requires_property_role(self):
        reservation = self._book()
        response = self.client.post('/api/check-in/', {'voucherCode': reservation['voucherCode']}, format='json')
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data['code'], 'PERMISSION_DENIED')

    def test_check_in_too_early_rejected(self):
        reservation = self._book()
        response = self.client.post(
            '/api/check-in/', {'voucherCode': reservation['voucherCode']}, format='json', **PROPERTY_HEADERS
        )
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data['code'], 'RESERVATION_NOT_STARTED')

    def test_finish_use_after_check_in_records_time(self):
        self.slot.start_dt = timezone.now() + timedelta(minutes=5)
        self.slot.end_dt = self.slot.start_dt + timedelta(hours=1)
        self.slot.save()
        reservation = self._book()
        voucher = reservation['voucherCode']
        self.client.post('/api/check-in/', {'voucherCode': voucher}, format='json', **PROPERTY_HEADERS)

        response = self.client.post('/api/finish-use/', {'voucherCode': voucher}, format='json', **PROPERTY_HEADERS)
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data['data']['status'], '已完成')
        self.assertIsNotNone(response.data['data']['finishedAt'])

        # 重复结束使用
        response = self.client.post('/api/finish-use/', {'voucherCode': voucher}, format='json', **PROPERTY_HEADERS)
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data['code'], 'RESERVATION_ALREADY_FINISHED')

    def test_finish_without_check_in_rejected(self):
        reservation = self._book()
        response = self.client.post(
            '/api/finish-use/', {'voucherCode': reservation['voucherCode']}, format='json', **PROPERTY_HEADERS
        )
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data['code'], 'RESERVATION_NOT_CHECKED_IN')

    def test_expired_unchecked_reservation_marked_no_show(self):
        # 已结束的时段上存在一条待核销预约
        past_slot = make_slot(
            self.facility,
            start_dt=timezone.now() - timedelta(hours=2),
            end_dt=timezone.now() - timedelta(hours=1),
        )
        reservation = create_reservation(past_slot)

        response = self.client.get('/api/reservations/', {'tenantPhone': reservation.tenant_phone})
        self.assertEqual(response.status_code, 200)
        result = next(r for r in response.data['data'] if r['id'] == reservation.id)
        self.assertEqual(result['status'], '爽约')
        self.assertIsNotNone(result['noShowAt'])

    def test_manual_no_show_and_duplicate(self):
        reservation = self._book()
        url = f"/api/reservations/{reservation['id']}/no-show/"
        response = self.client.post(url, format='json', **PROPERTY_HEADERS)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data']['status'], '爽约')

        response = self.client.post(url, format='json', **PROPERTY_HEADERS)
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data['code'], 'ALREADY_NO_SHOW')

        # 爽约后再核销必须报错
        response = self.client.post(
            '/api/check-in/', {'voucherCode': reservation['voucherCode']}, format='json', **PROPERTY_HEADERS
        )
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data['code'], 'RESERVATION_NO_SHOW')

    def test_persistence_after_reload(self):
        reservation = self._book()
        # 重新发起查询（模拟刷新/重新进入）
        response = self.client.get('/api/reservations/', {'tenantPhone': '13800000001'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['data']), 1)
        self.assertEqual(response.data['data'][0]['voucherCode'], reservation['voucherCode'])
