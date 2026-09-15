<template>
  <el-table :data="reservations" size="small" empty-text="暂无预约记录">
    <el-table-column prop="voucherCode" label="核销凭证" width="140">
      <template #default="{ row }">
        <span class="voucher">{{ row.voucherCode }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="facilityName" label="设施" width="110" />
    <el-table-column label="时段" width="200">
      <template #default="{ row }">{{ row.date }} {{ row.startTime }}-{{ row.endTime }}</template>
    </el-table-column>
    <el-table-column v-if="!hideTenant" label="租客" width="150">
      <template #default="{ row }">{{ row.tenantName }} / {{ row.tenantPhone }}</template>
    </el-table-column>
    <el-table-column label="状态" width="90">
      <template #default="{ row }">
        <el-tag :type="statusTagType(row.status)" size="small">{{ row.status }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column label="时间记录" min-width="230">
      <template #default="{ row }">
        <div class="times">
          <span v-if="row.checkedInAt">核销：{{ formatTime(row.checkedInAt) }}</span>
          <span v-if="row.finishedAt">结束：{{ formatTime(row.finishedAt) }}</span>
          <span v-if="row.cancelledAt">取消：{{ formatTime(row.cancelledAt) }}</span>
          <span v-if="row.noShowAt">爽约：{{ formatTime(row.noShowAt) }}</span>
          <span v-if="!hasTimestamp(row)" class="hint">-</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column v-if="$slots.actions || showCancel" label="操作" width="150" fixed="right">
      <template #default="{ row }">
        <slot name="actions" :row="row">
          <el-button
            v-if="showCancel && row.status === '待核销'"
            size="small"
            type="warning"
            @click="$emit('cancel', row)"
          >取消预约</el-button>
        </slot>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import type { Reservation, ReservationStatus } from '../types/facility';

defineProps<{
  reservations: Reservation[];
  showCancel?: boolean;
  hideTenant?: boolean;
}>();

defineEmits<{ (e: 'cancel', row: Reservation): void }>();

function statusTagType(status: ReservationStatus): 'success' | 'warning' | 'info' | 'danger' | 'primary' {
  switch (status) {
    case '待核销':
      return 'warning';
    case '已核销':
      return 'primary';
    case '已完成':
      return 'success';
    case '已取消':
      return 'info';
    case '爽约':
      return 'danger';
  }
}

function hasTimestamp(row: Reservation) {
  return Boolean(row.checkedInAt || row.finishedAt || row.cancelledAt || row.noShowAt);
}

function formatTime(value: string) {
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
</script>

<style scoped>
.voucher {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.times {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  color: #5a6478;
  line-height: 1.6;
}
</style>
