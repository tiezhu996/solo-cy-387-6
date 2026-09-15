from rest_framework.views import APIView

from app.apps.facility import serializers as slz
from app.apps.facility.permissions import require_property
from app.apps.facility.services import reservation_service
from app.utils.responses import ok


class ReservationListCreateView(APIView):
    def get(self, request):
        """预约记录查询（刷新/重新进入后仍可查看）。

        租客：按 tenantPhone 查询本人预约；物业：可按 facilityId / status / date 查全部。
        每次查询顺带把过期未核销的预约标记为爽约。
        """
        reservation_service.sweep_expired()
        reservations = reservation_service.list_reservations(
            tenant_phone=request.query_params.get('tenantPhone'),
            status=request.query_params.get('status'),
            facility_id=request.query_params.get('facilityId'),
            date=request.query_params.get('date'),
        )
        return ok(slz.ReservationSerializer(reservations, many=True).data)

    def post(self, request):
        """租客提交预约；并发提交时同一时段只有一个成功。"""
        data = slz.ReservationCreateSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        reservation = reservation_service.create_reservation(
            slot_id=data.validated_data['slotId'],
            tenant_name=data.validated_data['tenantName'],
            tenant_phone=data.validated_data['tenantPhone'],
        )
        return ok(slz.ReservationSerializer(reservation).data, status_code=201)


class ReservationCancelView(APIView):
    def post(self, request, reservation_id):
        """租客取消预约；取消后时段释放给他人预约。"""
        reservation = reservation_service.cancel_reservation(
            reservation_id, tenant_phone=request.data.get('tenantPhone')
        )
        return ok(slz.ReservationSerializer(reservation).data)


class CheckInView(APIView):
    @require_property
    def post(self, request):
        """物业按凭证核销到场，记录核销时间。"""
        data = slz.CheckInSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        reservation = reservation_service.check_in(data.validated_data['voucherCode'].strip().upper())
        return ok(slz.ReservationSerializer(reservation).data)


class FinishUseView(APIView):
    @require_property
    def post(self, request):
        """物业登记使用结束，记录使用结束时间。"""
        data = slz.CheckInSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        reservation = reservation_service.finish_use(data.validated_data['voucherCode'].strip().upper())
        return ok(slz.ReservationSerializer(reservation).data)


class NoShowView(APIView):
    @require_property
    def post(self, request, reservation_id):
        """物业把过期未到的预约标记为爽约。"""
        reservation = reservation_service.mark_no_show(reservation_id)
        return ok(slz.ReservationSerializer(reservation).data)
