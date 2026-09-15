from datetime import time, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from app.apps.facility.models import Facility, FacilitySlot


class Command(BaseCommand):
    help = '初始化共享设施与演示开放时段'

    def handle(self, *args, **options):
        gym, _ = Facility.objects.get_or_create(
            name='健身房', defaults={'location': '3 号楼 B1', 'description': '跑步机、力量器械，需着运动鞋'}
        )
        table, _ = Facility.objects.get_or_create(
            name='乒乓球室', defaults={'location': '2 号楼 1 层', 'description': '两张球台，请自带球拍'}
        )
        room, _ = Facility.objects.get_or_create(
            name='共享会议室', defaults={'location': '物业服务中心 2 层', 'description': '可容纳 10 人，配投影'}
        )

        today = timezone.localdate()
        created = 0
        for day_offset in range(0, 3):
            day = today + timedelta(days=day_offset)
            for facility, start_hour in ((gym, 9), (gym, 15), (table, 10), (room, 14)):
                start_dt = timezone.make_aware(
                    timezone.datetime.combine(day, time(hour=start_hour))
                )
                _, was_created = FacilitySlot.objects.get_or_create(
                    facility=facility,
                    start_dt=start_dt,
                    defaults={
                        'date': day,
                        'start_time': time(hour=start_hour),
                        'end_dt': start_dt + timedelta(hours=2),
                    },
                )
                created += int(was_created)

        # 一条已结束的时段，用于演示爽约标记
        local_now = timezone.localtime()
        past_start = (local_now - timedelta(hours=3)).replace(minute=0, second=0, microsecond=0)
        _, _ = FacilitySlot.objects.get_or_create(
            facility=gym,
            start_dt=past_start,
            defaults={
                'date': past_start.date(),
                'start_time': past_start.time(),
                'end_dt': past_start + timedelta(hours=2),
            },
        )

        self.stdout.write(self.style.SUCCESS(f'设施 {Facility.objects.count()} 个，本次新增时段 {created} 条'))
