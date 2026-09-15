from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from .facility import Facility


class FacilitySlot(models.Model):
    """设施开放时段，由物业维护。租客按时段提交预约。"""

    facility = models.ForeignKey(
        Facility, related_name='slots', on_delete=models.PROTECT, verbose_name='设施'
    )
    date = models.DateField('开放日期')
    start_time = models.TimeField('开始时间')
    start_dt = models.DateTimeField('开始时刻')
    end_dt = models.DateTimeField('结束时刻')
    is_open = models.BooleanField('是否开放预约', default=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        db_table = 'facility_slot'
        ordering = ['start_dt']
        indexes = [
            models.Index(fields=['facility', 'date']),
            models.Index(fields=['start_dt']),
        ]

    def clean(self):
        if self.start_dt and self.end_dt and self.end_dt <= self.start_dt:
            raise ValidationError('结束时间必须晚于开始时间')

    @property
    def is_past(self) -> bool:
        return self.end_dt < timezone.now()

    def active_reservation_exists(self) -> bool:
        from app.constants.enums import ACTIVE_RESERVATION_STATUS
        return self.reservations.filter(status__in=ACTIVE_RESERVATION_STATUS).exists()

    def __str__(self):
        return f'{self.facility_id}-{self.start_dt:%Y-%m-%d %H:%M}'
