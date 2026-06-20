<template>
  <div class="year-selector">
    <label class="ys-label">ปีงบประมาณ</label>
    <select class="ys-select" :value="dashStore.selectedYear" @change="onChange">
      <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      <!-- Fallback: show current year if list not loaded -->
      <option v-if="years.length === 0" :value="dashStore.selectedYear">
        {{ dashStore.selectedYear }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDashboardStore } from '../stores/dashboard'

const emit = defineEmits<{ (e: 'change', year: number): void }>()

const dashStore = useDashboardStore()

const years = computed(() =>
  dashStore.availableYears.length > 0
    ? dashStore.availableYears
    : [dashStore.selectedYear]
)

function onChange(e: Event) {
  const year = parseInt((e.target as HTMLSelectElement).value, 10)
  dashStore.setYear(year)
  emit('change', year)
}
</script>

<style scoped>
.year-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ys-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
}

.ys-select {
  background: var(--bg-base);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 7px 32px 7px 12px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--banana-dark);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23603808' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: border-color var(--transition-fast);
}

.ys-select:focus {
  outline: none;
  border-color: var(--banana-primary);
  box-shadow: 0 0 0 3px rgba(212, 163, 115, 0.2);
}
</style>
