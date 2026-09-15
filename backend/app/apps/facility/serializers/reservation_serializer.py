from rest_framework import serializers
from django.utils import timezone

from app.apps.facility.models import Reservation


class ReservationCreateSerializer(serializers.Serializer):
    slotId = serializers.IntegerField()
    tenantName = serializers.CharField(max_length=32)
    tenantPhone = serializers.CharField(max_length=20)

    def validate_tenantPhone(self, value):
        if not value.isdigit() or not (6 <= len(value) <= 20):
            raise serializers.ValidationError('手机号须为 6-20 位数字')
        return value


class CheckInSerializer(serializers.Serializer):
    voucherCode = serializers.CharField(max_length=12)


class ReservationSerializer(serializers.ModelSerializer):
    facilityId = serializers.IntegerField(source='facility_id', read_only=True)
    facilityName = serializers.CharField(source='facility.name', read_only=True)
    slotId = serializers.IntegerField(source='slot_id', read_only=True)
    date = serializers.DateField(source='slot.date', read_only=True)
    startTime = serializers.TimeField(source='slot.start_time', format='%H:%M', read_only=True)
    endTime = serializers.SerializerMethodField()

    def get_endTime(self, obj):
        return timezone.localtime(obj.slot.end_dt).strftime('%H:%M')
    voucherCode = serializers.CharField(source='voucher_code', read_only=True)
    tenantName = serializers.CharField(source='tenant_name', read_only=True)
    tenantPhone = serializers.CharField(source='tenant_phone', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    cancelledAt = serializers.DateTimeField(source='cancelled_at', read_only=True)
    checkedInAt = serializers.DateTimeField(source='checked_in_at', read_only=True)
    finishedAt = serializers.DateTimeField(source='finished_at', read_only=True)
    noShowAt = serializers.DateTimeField(source='no_show_at', read_only=True)

    class Meta:
        model = Reservation
        fields = [
            'id', 'facilityId', 'facilityName', 'slotId', 'date', 'startTime', 'endTime',
            'status', 'voucherCode', 'tenantName', 'tenantPhone',
            'createdAt', 'cancelledAt', 'checkedInAt', 'finishedAt', 'noShowAt',
        ]
