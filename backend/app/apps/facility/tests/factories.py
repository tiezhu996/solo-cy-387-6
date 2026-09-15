from datetime import timedelta

from django.utils import timezone

from app.apps.facility.models import Facility, FacilitySlot, Reservation, generate_voucher

PROPERTY_HEADERS = {'HTTP_X_USER_ROLE': 'property'}


def make_facility(name='健身房', status='开放'):
    return Facility.objects.create(name=name, location='B1', status=status)


def make_slot(facility, *, start_dt=None, hours=2, is_open=True, end_dt=None):
    if start_dt is None:
        start_dt = timezone.now() + timedelta(days=1)
    start_dt = _minute_aligned(start_dt)
    if end_dt is None:
        end_dt = start_dt + timedelta(hours=hours)
    return FacilitySlot.objects.create(
        facility=facility,
        date=timezone.localdate(start_dt),
        start_time=start_dt.time().replace(tzinfo=None),
        start_dt=start_dt,
        end_dt=end_dt,
        is_open=is_open,
    )


def _minute_aligned(dt):
    return dt.replace(second=0, microsecond=0)


def booking_payload(slot, phone='13800000001', name='张三'):
    return {'slotId': slot.id, 'tenantName': name, 'tenantPhone': phone}


def create_reservation(slot, *, phone='13800000001', name='张三', status='待核销'):
    """直接落库一条预约（绕过接口的时段有效性校验，便于构造爽约等场景）。"""
    return Reservation.objects.create(
        slot=slot,
        facility=slot.facility,
        tenant_name=name,
        tenant_phone=phone,
        status=status,
        voucher_code=generate_voucher(),
    )
