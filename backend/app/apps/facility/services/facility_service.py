from django.db import IntegrityError, transaction

from app.apps.facility.models import Facility
from app.constants.enums import FACILITY_STATUS
from app.utils.errors import ConflictError, NotFoundError


def list_facilities(include_closed: bool = True):
    queryset = Facility.objects.all().order_by('id')
    if not include_closed:
        queryset = queryset.filter(status='开放')
    return queryset


@transaction.atomic
def create_facility(*, name: str, location: str, description: str) -> Facility:
    try:
        # 内层保存点：唯一约束冲突时只回滚到保存点，不污染外层事务
        with transaction.atomic():
            return Facility.objects.create(name=name, location=location, description=description)
    except IntegrityError:
        raise ConflictError('FACILITY_NAME_DUPLICATE')


def get_facility(facility_id, require_open: bool = False) -> Facility:
    facility = Facility.objects.filter(id=facility_id).first()
    if facility is None or (require_open and facility.status != '开放'):
        raise NotFoundError('FACILITY_NOT_FOUND')
    return facility


def update_facility(facility_id, *, name=None, location=None, description=None, status=None) -> Facility:
    facility = get_facility(facility_id)
    if status is not None:
        if status not in FACILITY_STATUS:
            raise ConflictError('REPAIR_INVALID', f'非法设施状态：{status}')
        facility.status = status
    if name is not None:
        facility.name = name
    if location is not None:
        facility.location = location
    if description is not None:
        facility.description = description
    try:
        with transaction.atomic():
            facility.save()
    except IntegrityError:
        raise ConflictError('FACILITY_NAME_DUPLICATE')
    return facility


@transaction.atomic
def delete_facility(facility_id) -> None:
    facility = get_facility(facility_id)
    if facility.reservations.exists():
        raise ConflictError('FACILITY_IN_USE')
    # 无预约记录时连同开放时段一并删除
    facility.slots.all().delete()
    facility.delete()
