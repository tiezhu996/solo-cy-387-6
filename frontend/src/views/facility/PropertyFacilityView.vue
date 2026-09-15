<template>
  <section class="facility-panel">
    <h2>物业 · 设施与核销管理</h2>

    <el-card shadow="never" class="block">
      <template #header>到场核销（按预约凭证）</template>
      <div class="checkin-bar">
        <el-input
          v-model="voucherCode"
          placeholder="请输入或粘贴 12 位核销凭证"
          maxlength="12"
          style="width: 300px"
          @keyup.enter="onCheckIn"
        />
        <el-button type="primary" :loading="busy" @click="onCheckIn">核销到场</el-button>
        <el-button type="success" :loading="busy" @click="onFinish">登记使用结束</el-button>
        <el-button @click="onCheckInThenFinish">核销并结束（快速）</el-button>
        <span class="hint">开场前 15 分钟内核销；重复核销、取消或爽约凭证会被拒绝</span>
      </div>
    </el-card>

    <el-card shadow="never" class="block">
      <template #header>
        <div class="card-head">
          <span>全部预约与使用记录</span>
          <div class="filters">
            <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 130px">
              <el-option v-for="s in STATUSES" :key="s" :label="s" :value="s" />
            </el-select>
            <el-select v-model="query.facilityId" placeholder="全部设施" clearable style="width: 150px">
              <el-option v-for="f in facilities" :key="f.id" :label="f.name" :value="f.id" />
            </el-select>
            <el-date-picker v-model="query.date" type="date" value-format="YYYY-MM-DD" placeholder="日期" clearable style="width: 160px" />
            <el-button @click="loadReservations">刷新</el-button>
          </div>
        </div>
      </template>
      <ReservationTable :reservations="reservations" hide-tenant>
        <template #actions="{ row }">
          <el-button
            v-if="row.status === '待核销'"
            size="small"
            type="danger"
            @click="onNoShow(row)"
          >标记爽约</el-button>
          <el-tag v-else-if="row.status === '爽约'" type="danger" size="small">爽约</el-tag>
        </template>
      </ReservationTable>
    </el-card>

    <el-card shadow="never" class="block">
      <template #header>设施维护</template>
      <div class="maintain-bar">
        <el-input v-model="newFacility.name" placeholder="设施名称（如 瑜伽室）" style="width: 200px" />
        <el-input v-model="newFacility.location" placeholder="位置" style="width: 180px" />
        <el-input v-model="newFacility.description" placeholder="说明" style="width: 260px" />
        <el-button type="primary" @click="onCreateFacility">新增设施</el-button>
      </div>
      <el-table :data="facilities" size="small" style="margin-top: 12px">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="名称" width="130" />
        <el-table-column prop="location" label="位置" width="150" />
        <el-table-column prop="description" label="说明" min-width="180" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === '开放' ? 'success' : 'info'" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="190">
          <template #default="{ row }">
            <el-button size="small" @click="onToggleFacility(row)">
              {{ row.status === '开放' ? '停用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" @click="onDeleteFacility(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never" class="block">
      <template #header>开放时段维护</template>
      <div class="maintain-bar">
        <el-select v-model="newSlot.facilityId" placeholder="选择设施" style="width: 170px">
          <el-option v-for="f in openFacilities" :key="f.id" :label="f.name" :value="f.id" />
        </el-select>
        <el-date-picker v-model="newSlot.date" type="date" value-format="YYYY-MM-DD" placeholder="日期" style="width: 160px" />
        <el-time-picker v-model="newSlot.startTime" value-format="HH:mm" format="HH:mm" placeholder="开始" style="width: 120px" />
        <el-time-picker v-model="newSlot.endTime" value-format="HH:mm" format="HH:mm" placeholder="结束" style="width: 120px" />
        <el-button type="primary" @click="onCreateSlot">新增时段</el-button>
      </div>

      <div class="maintain-bar" style="margin-top: 12px">
        <el-select v-model="slotFilterFacility" placeholder="查看某设施的时段" clearable style="width: 200px">
          <el-option v-for="f in facilities" :key="f.id" :label="f.name" :value="f.id" />
        </el-select>
        <el-date-picker v-model="slotFilterDate" type="date" value-format="YYYY-MM-DD" placeholder="日期" clearable style="width: 160px" />
        <el-button @click="loadSlots">查询时段</el-button>
      </div>

      <el-table :data="managedSlots" size="small" style="margin-top: 12px">
        <el-table-column prop="facilityName" label="设施" width="120" />
        <el-table-column prop="date" label="日期" width="110" />
        <el-table-column label="时间" width="130">
          <template #default="{ row }">{{ row.startTime }} - {{ row.endTime }}</template>
        </el-table-column>
        <el-table-column label="预约状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '可预约' ? 'success' : row.status === '已约满' ? 'danger' : 'info'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" :disabled="row.booked" @click="onCloseSlot(row)">关闭</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  checkIn,
  closeSlot,
  createFacility,
  createSlot,
  deleteFacility,
  finishUse,
  listFacilities,
  listReservations,
  listSlots,
  markNoShow,
  updateFacility,
} from '../../api/facility';
import type { Facility, FacilitySlot, Reservation } from '../../types/facility';
import ReservationTable from '../../components/ReservationTable.vue';

const STATUSES = ['待核销', '已取消', '已核销', '已完成', '爽约'];

const facilities = ref<Facility[]>([]);
const reservations = ref<Reservation[]>([]);
const managedSlots = ref<FacilitySlot[]>([]);
const voucherCode = ref('');
const busy = ref(false);

const query = reactive<{ status?: string; facilityId?: number; date?: string }>({});
const slotFilterFacility = ref<number>();
const slotFilterDate = ref('');
const newFacility = reactive({ name: '', location: '', description: '' });
const newSlot = reactive<{ facilityId?: number; date: string; startTime: string; endTime: string }>({
  facilityId: undefined,
  date: '',
  startTime: '09:00',
  endTime: '11:00',
});

const openFacilities = computed(() => facilities.value.filter((f) => f.status === '开放'));

async function loadFacilities() {
  facilities.value = await listFacilities(true);
}

async function loadReservations() {
  try {
    reservations.value = await listReservations({
      status: query.status,
      facilityId: query.facilityId,
      date: query.date,
    });
  } catch (error) {
    ElMessage.error((error as Error).message);
  }
}

async function loadSlots() {
  try {
    managedSlots.value = await listSlots({
      facilityId: slotFilterFacility.value,
      date: slotFilterDate.value,
    });
  } catch (error) {
    ElMessage.error((error as Error).message);
  }
}

async function onCheckIn(): Promise<boolean> {
  if (!voucherCode.value.trim()) {
    ElMessage.warning('请输入凭证号');
    return false;
  }
  busy.value = true;
  try {
    const result = await checkIn(voucherCode.value.trim().toUpperCase());
    ElMessage.success(`核销成功：${result.facilityName} ${result.date} ${result.startTime}`);
    await loadReservations();
    return true;
  } catch (error) {
    ElMessage.error(`核销失败：${(error as Error).message}`);
    return false;
  } finally {
    busy.value = false;
  }
}

async function onFinish() {
  if (!voucherCode.value.trim()) {
    ElMessage.warning('请输入凭证号');
    return;
  }
  busy.value = true;
  try {
    const result = await finishUse(voucherCode.value.trim().toUpperCase());
    ElMessage.success(`已登记使用结束，结束时间已记录`);
    await loadReservations();
  } catch (error) {
    ElMessage.error(`操作失败：${(error as Error).message}`);
  } finally {
    busy.value = false;
  }
}

async function onCheckInThenFinish() {
  if (await onCheckIn()) {
    await onFinish();
  }
}

async function onNoShow(row: Reservation) {
  try {
    await ElMessageBox.confirm(`确认把凭证 ${row.voucherCode} 标记为爽约？`, '标记爽约', { type: 'warning' });
    await markNoShow(row.id);
    ElMessage.success('已标记爽约');
    await loadReservations();
  } catch (error) {
    if (error !== 'cancel') ElMessage.error((error as Error).message);
  }
}

async function onCreateFacility() {
  if (!newFacility.name) {
    ElMessage.warning('请填写设施名称');
    return;
  }
  try {
    await createFacility({ ...newFacility });
    ElMessage.success('设施已创建');
    newFacility.name = '';
    newFacility.location = '';
    newFacility.description = '';
    await loadFacilities();
  } catch (error) {
    ElMessage.error((error as Error).message);
  }
}

async function onToggleFacility(row: Facility) {
  try {
    await updateFacility(row.id, { status: row.status === '开放' ? '停用' : '开放' });
    await loadFacilities();
  } catch (error) {
    ElMessage.error((error as Error).message);
  }
}

async function onDeleteFacility(row: Facility) {
  try {
    await ElMessageBox.confirm(`确认删除设施「${row.name}」？存在预约时将被拒绝。`, '删除设施', { type: 'warning' });
    await deleteFacility(row.id);
    ElMessage.success('设施已删除');
    await loadFacilities();
  } catch (error) {
    if (error !== 'cancel') ElMessage.error((error as Error).message);
  }
}

async function onCreateSlot() {
  if (!newSlot.facilityId || !newSlot.date || !newSlot.startTime || !newSlot.endTime) {
    ElMessage.warning('请完整选择设施、日期和起止时间');
    return;
  }
  try {
    await createSlot({ ...newSlot, facilityId: newSlot.facilityId! });
    ElMessage.success('开放时段已创建');
    await loadSlots();
  } catch (error) {
    ElMessage.error((error as Error).message);
  }
}

async function onCloseSlot(row: FacilitySlot) {
  try {
    await closeSlot(row.id);
    ElMessage.success('时段已关闭');
    await loadSlots();
  } catch (error) {
    ElMessage.error((error as Error).message);
  }
}

onMounted(async () => {
  try {
    await loadFacilities();
    await Promise.all([loadReservations(), loadSlots()]);
  } catch (error) {
    ElMessage.error((error as Error).message);
  }
});
</script>
