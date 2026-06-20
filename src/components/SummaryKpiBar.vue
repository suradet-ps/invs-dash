<template>
  <div class="kpi-bar">
    <!-- Total Purchase Value -->
    <div class="kpi-card animate-fade-up" style="animation-delay: 0ms">
      <Banknote :size="26" class="kpi-icon" />
      <div class="kpi-body">
        <div class="kpi-label">มูลค่าสั่งซื้อรวม</div>
        <div v-if="dashStore.loading || !summary" class="kpi-value skeleton" style="width: 140px; height: 32px;" />
        <div v-else class="kpi-value font-display">
          {{ formatBaht(summary.total_value) }}
        </div>
      </div>
    </div>

    <!-- Active Drug Items -->
    <div class="kpi-card animate-fade-up" style="animation-delay: 80ms">
      <Pill :size="26" class="kpi-icon" />
      <div class="kpi-body">
        <div class="kpi-label">รายการยาที่มีการสั่งซื้อ</div>
        <div v-if="dashStore.loading || !summary" class="kpi-value skeleton" style="width: 80px; height: 32px;" />
        <div v-else class="kpi-value font-display">
          {{ summary.unique_drug_count.toLocaleString('th-TH') }}
          <span class="kpi-unit">รายการ</span>
        </div>
      </div>
    </div>

    <!-- Peak Fiscal Month -->
    <div class="kpi-card animate-fade-up" style="animation-delay: 160ms">
      <TrendingUp :size="26" class="kpi-icon" />
      <div class="kpi-body">
        <div class="kpi-label">เดือนที่มีมูลค่าสูงสุด</div>
        <div v-if="dashStore.loading || !summary" class="kpi-value skeleton" style="width: 120px; height: 32px;" />
        <div v-else class="kpi-value font-display">
          {{ FISCAL_MONTHS_LONG[summary.peak_month - 1] }}
          <span class="kpi-unit">{{ formatBaht(summary.peak_month_value) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Banknote, Pill, TrendingUp } from 'lucide-vue-next'
import { useDashboardStore } from '../stores/dashboard'
import { formatBaht, FISCAL_MONTHS_LONG } from '../utils/dateUtils'

const dashStore = useDashboardStore()
const summary = computed(() => dashStore.yearSummary)
</script>

<style scoped>
.kpi-bar {
  display: flex;
  gap: 14px;
}

.kpi-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--banana-primary);
  box-shadow: var(--shadow-card);
  padding: 14px 18px;
  transition: box-shadow var(--transition-med);
}

.kpi-card:hover {
  box-shadow: var(--shadow-hover);
}

.kpi-icon {
  color: var(--banana-dark);
  flex-shrink: 0;
  opacity: 0.75;
}

.kpi-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.kpi-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}

.kpi-value {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--banana-dark);
  display: flex;
  align-items: baseline;
  gap: 6px;
  white-space: nowrap;
}

.kpi-unit {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}
</style>


<style scoped>
.kpi-bar {
  display: flex;
  gap: 14px;
}

.kpi-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--banana-primary);
  box-shadow: var(--shadow-card);
  padding: 14px 18px;
  transition: box-shadow var(--transition-med);
}

.kpi-card:hover {
  box-shadow: var(--shadow-hover);
}

.kpi-icon {
  font-size: 26px;
  line-height: 1;
  flex-shrink: 0;
}

.kpi-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.kpi-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}

.kpi-value {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--banana-dark);
  display: flex;
  align-items: baseline;
  gap: 6px;
  white-space: nowrap;
}

.kpi-unit {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}
</style>
