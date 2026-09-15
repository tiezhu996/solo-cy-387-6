from rest_framework import serializers
from django.utils import timezone

from app.apps.facility.models import Facility, FacilitySlot, Reservation


class FacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Facility
        fields = ['id', 'name', 'location', 'description', 'status', 'createdAt']

    createdAt = serializers.DateTimeField(source='created_at', read_only=True)


class FacilityWriteSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=64)
    location = serializers.CharField(max_length=128, required=False, allow_blank=True, default='')
    description = serializers.CharField(max_length=255, required=False, allow_blank=True, default='')
    status = serializers.ChoiceField(choices=['开放', '停用'], required=False)


class SlotWriteSerializer(serializers.Serializer):
    facilityId = serializers.IntegerField()
    date = serializers.DateField()
    startTime = serializers.TimeField()
    endTime = serializers.TimeField()


class SlotSerializer(serializers.ModelSerializer):
    facilityName = serializers.CharField(source='facility.name', read_only=True)
    booked = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    expired = serializers.SerializerMethodField()
    reservationId = serializers.SerializerMethodField()

    class Meta:
        model = FacilitySlot
        fields = [
            'id', 'facilityId', 'facilityName', 'date', 'startTime', 'endTime',
            'status', 'booked', 'expired', 'reservationId',
        ]

    facilityId = serializers.IntegerField(source='facility_id', read_only=True)
    startTime = serializers.TimeField(source='start_time', format='%H:%M')
    endTime = serializers.SerializerMethodField()

    def get_endTime(self, obj):
        return timezone.localtime(obj.end_dt).strftime('%H:%M')

    def get_booked(self, obj):
        return getattr(obj, 'booked', obj.active_reservation_exists())

    def get_status(self, obj):
        if getattr(obj, 'expired', obj.is_past):
            return '已结束'
        return '已约满' if self.get_booked(obj) else '可预约'

    def get_expired(self, obj):
        return getattr(obj, 'expired', obj.is_past)

    def get_reservationId(self, obj):
        active = getattr(obj, 'active_reservation', None)
        return active.id if active else None
