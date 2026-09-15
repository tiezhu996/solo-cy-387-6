import uuid

from django.db import models
from django.utils import timezone

from app.constants.enums import ACTIVE_RESERVATION_STATUS, RESERVATION_STATUS
from .facility import Facility
from .slot import FacilitySlot


def generate_voucher() -> str:
    """预约凭证号：展示为 4 段短码。"""
    return uuid.uuid4().hex[:12].upper()


class Reservation(models.Model):
    """租客对设施时段的预约，以及到场核销与使用记录。"""

    slot = models.ForeignKey(
        FacilitySlot, related_name='reservations', on_delete=models.PROTECT, verbose_name='时段'
    )
    facility = models.ForeignKey(
        Facility, related_name='reservations', on_delete=models.PROTECT, verbose_name='设施'
    )
    tenant_name = models.CharField('租客姓名', max_length=32)
    tenant_phone = models.CharField('租客手机号', max_length=20)
    status = models.CharField(
        '状态', max_length=10, choices=[(s, s) for s in RESERVATION_STATUS], default='待核销'
    )
    voucher_code = models.CharField('核销凭证号', max_length=12, unique=True)

    created_at = models.DateTimeField('预约时间', auto_now_add=True)
    cancelled_at = models.DateTimeField('取消时间', null=True, blank=True)
    checked_in_at = models.DateTimeField('核销时间', null=True, blank=True)
    finished_at = models.DateTimeField('使用结束时间', null=True, blank=True)
    no_show_at = models.DateTimeField('爽约标记时间', null=True, blank=True)

    class Meta:
        db_table = 'facility_reservation'
        ordering = ['-created_at']
        constraints = [
            # 同一设施同一时段只允许一个有效预约（待核销/已核销）。
            # 部分唯一索引由数据库保证，并发提交时数据库直接拒绝第二条。
            models.UniqueConstraint(
                fields=['facility', 'slot'],
                condition=models.Q(status__in=ACTIVE_RESERVATION_STATUS),
                name='uniq_active_reservation_per_slot',
            )
        ]
        indexes = [
            models.Index(fields=['tenant_phone']),
            models.Index(fields=['status']),
            models.Index(fields=['voucher_code']),
        ]

    @property
    def is_active(self) -> bool:
        return self.status in ACTIVE_RESERVATION_STATUS

    def mark_cancelled(self):
        self.status = '已取消'
        self.cancelled_at = timezone.now()

    def mark_checked_in(self):
        self.status = '已核销'
        self.checked_in_at = timezone.now()

    def mark_finished(self):
        self.status = '已完成'
        self.finished_at = timezone.now()

    def mark_no_show(self):
        self.status = '爽约'
        self.no_show_at = timezone.now()

    def __str__(self):
        return f'{self.voucher_code}-{self.status}'
