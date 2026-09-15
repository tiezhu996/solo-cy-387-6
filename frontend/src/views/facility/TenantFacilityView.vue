<template>
  <section class="facility-panel">
    <h2>租客 · 设施预约</h2>

    <el-card shadow="never" class="block">
      <div class="identity">
        <el-input v-model="profile.name" placeholder="租客姓名" style="width: 160px" />
        <el-input v-model="profile.phone" placeholder="手机号（用于查询我的预约）" style="width: 260px" />
        <el-button @click="saveProfile">记住我</el-button>
        <span class="hint">身份信息保存在本地，刷新后仍可查看本人预约</span>
      </div>
    </el-card>

    <el-card shadow="never" class="block">
      <template #header>
        <div class="card-head">
          <span>可预约时段</span>
          <div class="filters">
            <el-select v-model="facilityFilter" placeholder="全部设施" clearable style="width: 180px">
              <el-option v-for="f in facilities" :key="f.id" :label="f.name" :value="f.id" />
            </el-select>
            <el-date-picker
              v-model="dateFilter"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
              clearable
              style="width: 170px"
            />
            <el-button @click="loadSlots">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table :data="slots" v-loading="loadingSlots" size="small" empty-text="暂无可预约时段">
        <el-table-column prop="facilityName" label="设施" width="120" />
        <el-table-column label="位置" width="140">
          <template #default="{ row }">{{ facilityLocation(row.facilityId) }}</template>
        </el-table-column>
        <el-table-column prop="date" label="日期" width="110" />
        <el-table-column label="时间" width="130">
          <template #default="{ row }">{{ row.startTime }} - {{ row.endTime }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="slotTagType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :disabled="row.status !== '可预约'"
              @click="book(row)"
            >预约</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never" class="block">
      <template #header>
        <div class="card-head">
          <span>我的预约（凭证与状态）</span>
          <el-button size="small" @click="loadMyReservations">刷新</el-button>
        </div>
      </template>
      <ReservationTable :reservations="myReservations" @cancel="onCancel" show-cancel />
    </el-card>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  cancelReservation,
  createReservation,
  listFacilities,
  listReservations,
  listSlots,
} from '../../api/facility';
import type { Facility, FacilitySlot, Reservation } from '../../types/facility';
import { profileStore } from '../../utils/storage';
import ReservationTable from '../../components/ReservationTable.vue';

const facilities = ref<Facility[]>([]);
const slots = ref<FacilitySlot[]>([]);
const myReservations = ref<Reservation[]>([]);
const facilityFilter = ref<number>();
const dateFilter = ref('');
const loadingSlots = ref(false);
const profile = ref(profileStore.load());

function saveProfile() {
  if (!profile.value.name || !profile.value.phone) {
    ElMessage.warning('请先填写姓名和手机号');
    return;
  }
  profileStore.save(profile.value);
  ElMessage.success('身份已记住');
  loadMyReservations();
}

function facilityLocation(id: number) {
  return facilities.value.find((f) => f.id === id)?.location ?? '-';
}

function slotTagType(status: string) {
  if (status === '可预约') return 'success';
  if (status === '已约满') return 'danger';
  return 'info';
}

async function loadSlots() {
  loadingSlots.value = true;
  try {
    slots.value = await listSlots({ facilityId: facilityFilter.value, date: dateFilter.value });
  } catch (error) {
    ElMessage.error((error as Error).message);
  } finally {
    loadingSlots.value = false;
  }
}

async function loadMyReservations() {
  if (!profile.value.phone) {
    myReservations.value = [];
    return;
  }
  try {
    myReservations.value = await listReservations({ tenantPhone: profile.value.phone });
  } catch (error) {
    ElMessage.error((error as Error).message);
  }
}

async function book(slot: FacilitySlot) {
  if (!profile.value.name || !profile.value.phone) {
    ElMessage.warning('请先在上方填写租客姓名和手机号');
    return;
  }
  try {
    const reservation = await createReservation({
      slotId: slot.id,
      tenantName: profile.value.name,
      tenantPhone: profile.value.phone,
    });
    ElMessage.success(`预约成功，核销凭证：${reservation.voucherCode}`);
    await Promise.all([loadSlots(), loadMyReservations()]);
  } catch (error) {
    ElMessage.error((error as Error).message);
  }
}

async function onCancel(reservation: Reservation) {
  try {
    await cancelReservation(reservation.id, profile.value.phone);
    ElMessage.success('预约已取消，时段已释放');
    await Promise.all([loadSlots(), loadMyReservations()]);
  } catch (error) {
    ElMessage.error((error as Error).message);
  }
}

onMounted(async () => {
  facilities.value = await listFacilities(false);
  await Promise.all([loadSlots(), loadMyReservations()]);
});
</script>
