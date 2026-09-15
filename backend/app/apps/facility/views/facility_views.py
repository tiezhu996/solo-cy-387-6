from rest_framework.views import APIView

from app.apps.facility import serializers as slz
from app.apps.facility.permissions import require_property
from app.apps.facility.services import facility_service, slot_service
from app.utils.responses import ok


class FacilityListCreateView(APIView):
    def get(self, request):
        """设施列表（租客/物业均可查看）。"""
        include_closed = request.query_params.get('includeClosed', 'true') == 'true'
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
        """可预约开放时段：支持 facilityId / date 过滤，附带可预约状态。"""
        facility_id = request.query_params.get('facilityId')
        date = request.query_params.get('date')
        slots = slot_service.list_slots(facility_id=facility_id, date=date)
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
