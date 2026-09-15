from datetime import timedelta

from django.db import IntegrityError, transaction
from django.utils import timezone

from app.apps.facility.models import FacilitySlot, Reservation, generate_voucher
from app.constants.enums import ACTIVE_RESERVATION_STATUS
from app.utils.errors import ConflictError, NotFoundError
from app.utils.logger import get_logger

logger = get_logger('facility.reservation')

# 开场前可核销的提前量
CHECK_IN_GRACE_MINUTES = 15


def _get_by_voucher(voucher_code: str) -> Reservation:
    reservation = Reservation.objects.select_related('slot', 'facility').filter(voucher_code=voucher_code).first()
    if reservation is None:
        raise NotFoundError('VOUCHER_NOT_FOUND')
    return reservation


@transaction.atomic
def create_reservation(*, slot_id, tenant_name, tenant_phone) -> Reservation:
    """租客提交预约。

    并发安全：先对时段行加排他锁串行化，再由数据库部分唯一索引兜底，
    同一设施同一时段的并发提交最多只有一个成功。
    """
    slot = FacilitySlot.objects.select_for_update().select_related('facility').filter(id=slot_id).first()
    if slot is None:
        raise NotFoundError('SLOT_NOT_FOUND')
    if slot.facility.status != '开放' or not slot.is_open:
        raise ConflictError('SLOT_CLOSED')
    now = timezone.now()
    if slot.end_dt < now:
        raise ConflictError('SLOT_CLOSED', '该时段已结束，无法预约')
    if slot.start_dt < now:
        raise ConflictError('SLOT_CLOSED', '该时段已开始，无法预约')
    if Reservation.objects.filter(slot=slot, status__in=ACTIVE_RESERVATION_STATUS).exists():
        raise ConflictError('SLOT_FULL')

    reservation = Reservation(
        slot=slot,
        facility=slot.facility,
        tenant_name=tenant_name,
        tenant_phone=tenant_phone,
        status='待核销',
        voucher_code=generate_voucher(),
    )
    try:
        reservation.save()
    except IntegrityError:
        # 并发兜底：部分唯一索引冲突说明该时段已有有效预约
        logger.warning('时段 %s 并发预约冲突', slot_id)
        raise ConflictError('SLOT_FULL')
    logger.info('预约成功 voucher=%s slot=%s tenant=%s', reservation.voucher_code, slot_id, tenant_phone)
    return reservation


@transaction.atomic
def cancel_reservation(reservation_id, *, tenant_phone=None) -> Reservation:
    reservation = Reservation.objects.select_for_update().filter(id=reservation_id).first()
    if reservation is None:
        raise NotFoundError('RESERVATION_NOT_FOUND')
    if tenant_phone and reservation.tenant_phone != tenant_phone:
        raise NotFoundError('RESERVATION_NOT_FOUND')
    if reservation.status == '已取消':
        raise ConflictError('ALREADY_CANCELLED')
    if reservation.status == '爽约':
        raise ConflictError('RESERVATION_NO_SHOW')
    if reservation.status in ('已核销', '已完成'):
        raise ConflictError('NOT_ACTIVE_RESERVATION', '预约已核销，无法取消')
    reservation.mark_cancelled()
    reservation.save()
    logger.info('预约已取消 voucher=%s', reservation.voucher_code)
    return reservation


@transaction.atomic
def check_in(voucher_code: str) -> Reservation:
    """物业按凭证核销到场。"""
    reservation = Reservation.objects.select_for_update().select_related('slot').filter(
        voucher_code=voucher_code
    ).first()
    if reservation is None:
        raise NotFoundError('VOUCHER_NOT_FOUND')

    if reservation.status in ('已核销', '已完成'):
        raise ConflictError('VOUCHER_ALREADY_USED')
    if reservation.status == '已取消':
        raise ConflictError('RESERVATION_CANCELLED')
    if reservation.status == '爽约':
        raise ConflictError('RESERVATION_NO_SHOW')

    now = timezone.now()
    if now > reservation.slot.end_dt:
        # 已超过时段结束时间仍未到场：自动爽约
        reservation.mark_no_show()
        reservation.save()
        logger.info('预约超时自动爽约 voucher=%s', reservation.voucher_code)
        raise ConflictError('RESERVATION_NO_SHOW')
    earliest = reservation.slot.start_dt - timedelta(minutes=CHECK_IN_GRACE_MINUTES)
    if now < earliest:
        raise ConflictError('RESERVATION_NOT_STARTED')

    reservation.mark_checked_in()
    reservation.save()
    logger.info('凭证核销成功 voucher=%s', reservation.voucher_code)
    return reservation


@transaction.atomic
def finish_use(voucher_code: str) -> Reservation:
    """物业登记使用结束，记录结束时间。"""
    reservation = _get_by_voucher(voucher_code)
    if reservation.status == '已完成':
        raise ConflictError('RESERVATION_ALREADY_FINISHED')
    if reservation.status == '已取消':
        raise ConflictError('RESERVATION_CANCELLED')
    if reservation.status == '爽约':
        raise ConflictError('RESERVATION_NO_SHOW')
    if reservation.status != '已核销':
        raise ConflictError('RESERVATION_NOT_CHECKED_IN')
    reservation.mark_finished()
    reservation.save()
    logger.info('使用结束 voucher=%s', reservation.voucher_code)
    return reservation


@transaction.atomic
def mark_no_show(reservation_id) -> Reservation:
    reservation = Reservation.objects.select_for_update().filter(id=reservation_id).first()
    if reservation is None:
        raise NotFoundError('RESERVATION_NOT_FOUND')
    if reservation.status == '爽约':
        raise ConflictError('ALREADY_NO_SHOW')
    if reservation.status == '已取消':
        raise ConflictError('RESERVATION_CANCELLED')
    if reservation.status in ('已核销', '已完成'):
        raise ConflictError('NOT_ACTIVE_RESERVATION', '预约已核销到场，不能标记爽约')
    reservation.mark_no_show()
    reservation.save()
    return reservation


def sweep_expired() -> int:
    """把已过结束时间且仍待核销的预约批量标记为爽约，返回处理数量。"""
    now = timezone.now()
    count = Reservation.objects.filter(status='待核销', slot__end_dt__lt=now).update(
        status='爽约', no_show_at=now
    )
    if count:
        logger.info('批量标记爽约 %s 条', count)
    return count


def list_reservations(*, tenant_phone=None, status=None, facility_id=None, date=None):
    queryset = Reservation.objects.select_related('slot', 'facility')
    if tenant_phone:
        queryset = queryset.filter(tenant_phone=tenant_phone)
    if status:
        queryset = queryset.filter(status=status)
    if facility_id:
        queryset = queryset.filter(facility_id=facility_id)
    if date:
        queryset = queryset.filter(slot__date=date)
    return list(queryset.order_by('-created_at'))
