from django.db import models

from app.constants.enums import FACILITY_STATUS


class Facility(models.Model):
    """共享设施，由物业维护（如健身房、会议室、乒乓球室）。"""

    name = models.CharField('设施名称', max_length=64, unique=True)
    location = models.CharField('位置', max_length=128, blank=True, default='')
    description = models.CharField('说明', max_length=255, blank=True, default='')
    status = models.CharField('状态', max_length=10, choices=[(s, s) for s in FACILITY_STATUS], default='开放')
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        db_table = 'facility'
        ordering = ['id']

    def __str__(self):
        return self.name
