<template>
  <main class="page">
    <section class="top-nav">
      <span class="brand">RentFind · 共享设施预约</span>
      <el-radio-group v-model="view" size="large">
        <el-radio-button value="tenant">租客工作台</el-radio-button>
        <el-radio-button value="property">物业工作台</el-radio-button>
      </el-radio-group>
    </section>

    <TenantFacilityView v-if="view === 'tenant'" />
    <PropertyFacilityView v-else />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TenantFacilityView from './views/facility/TenantFacilityView.vue';
import PropertyFacilityView from './views/facility/PropertyFacilityView.vue';

const view = ref<'tenant' | 'property'>('tenant');
</script>
