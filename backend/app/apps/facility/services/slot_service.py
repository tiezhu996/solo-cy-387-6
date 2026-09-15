from datetime import datetime

from django.db import transaction
from django.utils import timezone

from app.apps.facility.models import Facility, FacilitySlot, Reservation
from app.constants.enums import ACTIVE_RESERVATION_STATUS
from app.utils.errors import ConflictError, NotFoundError
from app.utils.logger import get_logger
from .facility_service import get_facility

logger = get_logger('facility.slot')


def _aware_dt(date, time_value):
    raw = datetime.combine(date, time_value)
    return timezone.make_aware(raw) if timezone.is_naive(raw) else raw


@transaction.atomic
def create_slot(*, facility_id, date, start_time, end_time) -> FacilitySlot:
    facility = get_facility(facility_id, require_open=True)
    start_dt = _aware_dt(date, start_time)
    end_dt = _aware_dt(date, end_time)
    if end_dt <= start_dt:
        raise ConflictError('SLOT_TIME_INVALID')

    # 锁定该设施的时段行后再判重，避免并发创建出相互重叠的时段
    existing = list(
        FacilitySlot.objects.select_for_update().filter(facility=facility).filter(start_dt__lt=end_dt, end_dt__gt=start_dt)
    )
    if existing:
        raise ConflictError('SLOT_OVERLAP')

    slot = FacilitySlot.objects.create(
        facility=facility, date=date, start_time=start_time, start_dt=start_dt, end_dt=end_dt
    )
    logger.info('设施 %s 新增开放时段 %s', facility_id, slot.id)
    return slot


def get_slot(slot_id) -> FacilitySlot:
    slot = FacilitySlot.objects.filter(id=slot_id).first()
    if slot is None:
        raise NotFoundError('SLOT_NOT_FOUND')
    return slot


def list_slots(*, facility_id=None, date=None, with_availability: bool = True, include_disabled: bool = False):
    """开放时段列表。

    默认只返回"开放中"设施的时段——停用设施的时段不出现在可预约列表；
    include_disabled=True 时（物业维护视图）可查看停用设施的时段。
    with_availability 时附带预约状态（可预约/已约满）。
    """
    queryset = FacilitySlot.objects.select_related('facility').filter(is_open=True)
    if not include_disabled:
        queryset = queryset.filter(facility__status='开放')
    if facility_id is not None:
        queryset = queryset.filter(facility_id=facility_id)
    if date is not None:
        queryset = queryset.filter(date=date)
    slots = list(queryset.order_by('start_dt'))

    if not with_availability:
        return slots

    active_map = {
        r.slot_id: r
        for r in Reservation.objects.filter(slot_id__in=[s.id for s in slots], status__in=ACTIVE_RESERVATION_STATUS)
    }
    now = timezone.now()
    for slot in slots:
        slot.active_reservation = active_map.get(slot.id)
        slot.booked = slot.id in active_map
        slot.expired = slot.end_dt < now
    return slots


@transaction.atomic
def close_slot(slot_id) -> FacilitySlot:
    slot = get_slot(slot_id)
    if Reservation.objects.filter(slot=slot, status__in=ACTIVE_RESERVATION_STATUS).exists():
        raise ConflictError('FACILITY_IN_USE', '该时段存在有效预约，无法关闭')
    slot.is_open = False
    slot.save()
    return slot
