from datetime import timedelta

from django.utils import timezone
from rest_framework.test import APITestCase

from .factories import PROPERTY_HEADERS, booking_payload, make_facility, make_slot


class FacilityMaintenanceTests(APITestCase):
    def test_tenant_cannot_create_facility(self):
        response = self.client.post('/api/facilities/', {'name': '台球室'}, format='json')
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data['code'], 'PERMISSION_DENIED')

    def test_create_update_disable_facility(self):
        response = self.client.post(
            '/api/facilities/',
            {'name': '台球室', 'location': '1 号楼', 'description': '两张中式黑八球台'},
            format='json',
            **PROPERTY_HEADERS,
        )
        self.assertEqual(response.status_code, 201, response.data)
        facility_id = response.data['data']['id']

        # 重名报错
        response = self.client.post('/api/facilities/', {'name': '台球室'}, format='json', **PROPERTY_HEADERS)
        self.assertEqual(response.status_code, 409)

        # 停用
        response = self.client.patch(
            f'/api/facilities/{facility_id}/', {'status': '停用'}, format='json', **PROPERTY_HEADERS
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data']['status'], '停用')

        # 不存在的设施
        response = self.client.patch('/api/facilities/9999/', {'status': '开放'}, format='json', **PROPERTY_HEADERS)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data['code'], 'FACILITY_NOT_FOUND')

    def test_create_slot_validation_and_overlap(self):
        facility = make_facility()
        day = (timezone.now() + timedelta(days=3)).date().isoformat()
        response = self.client.post(
            '/api/slots/',
            {'facilityId': facility.id, 'date': day, 'startTime': '09:00', 'endTime': '11:00'},
            format='json',
            **PROPERTY_HEADERS,
        )
        self.assertEqual(response.status_code, 201, response.data)

        # 时间倒挂
        response = self.client.post(
            '/api/slots/',
            {'facilityId': facility.id, 'date': day, 'startTime': '15:00', 'endTime': '14:00'},
            format='json',
            **PROPERTY_HEADERS,
        )
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data['code'], 'SLOT_TIME_INVALID')

        # 与已有时段重叠
        response = self.client.post(
            '/api/slots/',
            {'facilityId': facility.id, 'date': day, 'startTime': '10:00', 'endTime': '12:00'},
            format='json',
            **PROPERTY_HEADERS,
        )
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data['code'], 'SLOT_OVERLAP')

        # 不存在的设施
        response = self.client.post(
            '/api/slots/',
            {'facilityId': 9999, 'date': day, 'startTime': '08:00', 'endTime': '09:00'},
            format='json',
            **PROPERTY_HEADERS,
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data['code'], 'FACILITY_NOT_FOUND')

    def test_delete_facility_with_reservation_rejected(self):
        facility = make_facility()
        slot = make_slot(facility)
        self.client.post('/api/reservations/', booking_payload(slot), format='json')

        response = self.client.delete(f'/api/facilities/{facility.id}/', **PROPERTY_HEADERS)
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data['code'], 'FACILITY_IN_USE')
