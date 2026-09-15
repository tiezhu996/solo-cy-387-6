from rest_framework.views import APIView

from app.apps.facility import serializers as slz
from app.apps.facility.permissions import assert_property_role, require_property
from app.apps.facility.services import facility_service, slot_service
from app.utils.responses import ok


class FacilityListCreateView(APIView):
    def get(self, request):
        """设施列表。

        默认只返回开放设施（供租客查看与筛选）；includeClosed=true 可同时
        查看停用设施，但该维护参数仅物业角色可用，租客携带将被拒绝（403）。
        """
        include_closed = request.query_params.get('includeClosed') == 'true'
        if include_closed:
            assert_property_role(request)
        facilities = facility_service.list_facilities(include_closed=include_closed)
        return ok(slz.FacilitySerializer(facilities, many=True).data)

    @require_property
    def post(self, request):
        """物业维护：新增设施。"""
        data = slz.FacilityWriteSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        facility = facility_service.create_facility(
            name=data.validated_data['name'],
            location=data.validated_data.get('location', ''),
            description=data.validated_data.get('description', ''),
        )
        return ok(slz.FacilitySerializer(facility).data, status_code=201)


class FacilityDetailView(APIView):
    @require_property
    def patch(self, request, facility_id):
        """物业维护：修改设施（名称/位置/说明/停用启用）。"""
        data = slz.FacilityWriteSerializer(data=request.data, partial=True)
        data.is_valid(raise_exception=True)
        facility = facility_service.update_facility(facility_id, **data.validated_data)
        return ok(slz.FacilitySerializer(facility).data)

    @require_property
    def delete(self, request, facility_id):
        """物业维护：删除设施（存在预约时拒绝）。"""
        facility_service.delete_facility(facility_id)
        return ok({'id': facility_id, 'deleted': True})


class SlotListCreateView(APIView):
    def get(self, request):
        """可预约开放时段：支持 facilityId / date 过滤，附带可预约状态。

        默认只展示开放设施的时段；物业维护时传 includeDisabled=true
        可查看已停用设施的时段。
        """
        facility_id = request.query_params.get('facilityId')
        date = request.query_params.get('date')
        include_disabled = request.query_params.get('includeDisabled') == 'true'
        # includeDisabled 是维护参数，仅物业角色可用，租客携带将被拒绝（403）
        if include_disabled:
            assert_property_role(request)
        slots = slot_service.list_slots(
            facility_id=facility_id, date=date, include_disabled=include_disabled
        )
        return ok(slz.SlotSerializer(slots, many=True).data)

    @require_property
    def post(self, request):
        """物业维护：为设施新增开放时段。"""
        data = slz.SlotWriteSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        slot = slot_service.create_slot(
            facility_id=data.validated_data['facilityId'],
            date=data.validated_data['date'],
            start_time=data.validated_data['startTime'],
            end_time=data.validated_data['endTime'],
        )
        return ok(slz.SlotSerializer(slot).data, status_code=201)


class SlotCloseView(APIView):
    @require_property
    def post(self, request, slot_id):
        """物业维护：关闭开放时段（存在有效预约时拒绝）。"""
        slot = slot_service.close_slot(slot_id)
        return ok({'id': slot.id, 'isOpen': slot.is_open})
