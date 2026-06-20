<template>
  <div class="top-drugs-panel card">
    <div class="panel-header">
      <span class="panel-title">
        <Trophy :size="14" />
        Top {{ topDrugs.length }} ยาสูงสุด
      </span>
      <span class="panel-subtitle">ปีงบประมาณ {{ dashStore.selectedYear }}</span>
    </div>

    <!-- Loading skeleton -->
    <template v-if="dashStore.loading">
      <div v-for="i in 10" :key="i" class="skeleton-row">
        <div class="skeleton" style="width: 24px; height: 20px;" />
        <div class="skeleton-info">
          <div class="skeleton" style="width: 60%; height: 14px;" />
          <div class="skeleton" style="width: 40%; height: 10px; margin-top: 4px;" />
        </div>
        <div class="skeleton" style="width: 80px; height: 14px;" />
      </div>
    </template>

    <!-- Empty state -->
    <div v-else-if="topDrugs.length === 0 && !dashStore.loading" class="empty-state">
      <BarChart2 :size="36" class="empty-icon" />
      <p>ยังไม่มีข้อมูล</p>
      <p class="text-muted" style="font-size: 12px;">เชื่อมต่อฐานข้อมูลเพื่อเริ่มต้น</p>
    </div>

    <!-- Drug list -->
    <template v-else>
      <div
        v-for="(drug, idx) in topDrugs"
        :key="drug.working_code"
        :class="[
          'drug-row',
          { 'drug-row--active': dashStore.selectedWorkingCode === drug.working_code }
        ]"
        @click="selectDrug(drug.working_code)"
      >
        <span class="rank">{{ idx + 1 }}</span>

        <div class="drug-info">
          <span
            class="drug-name"
            :data-tooltip="drug.drug_name.length > 28 ? drug.drug_name : undefined"
          >
            {{ truncate(drug.drug_name, 28) || '—' }}
          </span>
          <span class="drug-code font-mono">{{ drug.working_code }}</span>
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: barWidth(drug.total_value) + '%' }" />
          </div>
        </div>

        <span class="drug-value">{{ formatBaht(drug.total_value) }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Trophy, BarChart2 } from 'lucide-vue-next'
import { useDashboardStore } from '../stores/dashboard'
import { formatBaht } from '../utils/dateUtils'

const emit = defineEmits<{ (e: 'select', code: string): void }>()

const dashStore = useDashboardStore()
const topDrugs = computed(() => dashStore.topDrugs)

const maxValue = computed(() =>
  topDrugs.value.length > 0 ? topDrugs.value[0].total_value : 1
)

function barWidth(val: number): number {
  return maxValue.value === 0 ? 0 : Math.round((val / maxValue.value) * 100)
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + '…' : s
}

function selectDrug(code: string) {
  dashStore.setSelectedDrug(code)
  emit('select', code)
}
</script>

<style scoped>
.top-drugs-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.panel-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--banana-dark);
}

.panel-subtitle {
  font-size: 12px;
  color: var(--text-muted);
}

.drug-row,
.skeleton-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-subtle);
  cursor: pointer;
  transition: background var(--transition-fast);
  min-height: 52px;
}

.drug-row:last-child,
.skeleton-row:last-child { border-bottom: none; }

.drug-row:hover { background: var(--bg-elevated); }

.drug-row--active {
  background: var(--banana-leaf);
  border-left: 3px solid var(--banana-accent);
  padding-left: 11px;
}

.rank {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--banana-dark);
  min-width: 22px;
  text-align: center;
  flex-shrink: 0;
}

.drug-info {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.drug-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.drug-code {
  font-size: 11px;
  color: var(--text-muted);
}

.bar-track {
  height: 4px;
  background: var(--bg-elevated);
  border-radius: 2px;
  margin-top: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: var(--chart-bar);
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.drug-row--active .bar-fill { background: var(--chart-bar-peak); }

.drug-value {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  color: var(--banana-dark);
  white-space: nowrap;
  flex-shrink: 0;
}

.skeleton-row { cursor: default; }

.skeleton-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  padding: 32px;
}

.empty-icon {
  color: var(--banana-primary);
  opacity: 0.6;
}
</style>
