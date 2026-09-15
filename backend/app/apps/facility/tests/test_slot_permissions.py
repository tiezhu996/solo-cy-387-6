from rest_framework.test import APITestCase

from .factories import PROPERTY_HEADERS, make_facility, make_slot


class MaintenanceParamPermissionTests(APITestCase):
    """维护视角的查询参数仅物业角色可用，租客越权读取必须被明确拒绝。"""

    def setUp(self):
        self.open_facility = make_facility('健身房')
        self.disabled_facility = make_facility('停用的瑜伽室', status='停用')
        make_slot(self.open_facility)
        make_slot(self.disabled_facility)

    def test_tenant_include_disabled_slots_forbidden(self):
        # 无角色头
        response = self.client.get('/api/slots/', {'includeDisabled': 'true'})
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data['code'], 'PERMISSION_DENIED')

        # 伪造角色头也不行
        response = self.client.get('/api/slots/', {'includeDisabled': 'true'}, HTTP_X_USER_ROLE='tenant')
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data['code'], 'PERMISSION_DENIED')

    def test_tenant_include_closed_facilities_forbidden(self):
        response = self.client.get('/api/facilities/', {'includeClosed': 'true'})
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data['code'], 'PERMISSION_DENIED')

    def test_property_can_use_maintenance_params(self):
        response = self.client.get('/api/slots/', {'includeDisabled': 'true'}, **PROPERTY_HEADERS)
        self.assertEqual(response.status_code, 200)
        names = {s['facilityName'] for s in response.data['data']}
        self.assertIn('停用的瑜伽室', names)

        response = self.client.get('/api/facilities/', {'includeClosed': 'true'}, **PROPERTY_HEADERS)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['data']), 2)

    def test_default_lists_hide_disabled_for_everyone_without_param(self):
        # 默认列表（无需任何角色）不含停用设施及其时段
        response = self.client.get('/api/facilities/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual([f['name'] for f in response.data['data']], ['健身房'])

        response = self.client.get('/api/slots/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(all(s['facilityName'] != '停用的瑜伽室' for s in response.data['data']))
