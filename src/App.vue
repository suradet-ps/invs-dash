<template>
  <div class="app-shell">
    <!-- ═══ Top Navbar ═══ -->
    <header class="navbar">
      <div class="navbar-brand">
        <Banana :size="22" class="brand-icon" aria-hidden="true" />
        <div class="brand-text">
          <span class="brand-title">INVS Dash</span>
          <span class="brand-sub">โรงพยาบาลสระโบสถ์</span>
        </div>
      </div>

      <div class="navbar-controls">
        <YearSelector @change="onYearChange" />
        <DrugSearchBar @select="onDrugSearch" />

        <!-- Connection badge -->
        <span :class="['badge', dbStore.connected ? 'badge-connected' : 'badge-disconnected']">
          <span :class="['status-dot', dbStore.connected ? 'dot-green' : 'dot-red']" />
          {{ dbStore.connected ? 'เชื่อมต่อแล้ว' : 'ยังไม่ได้เชื่อมต่อ' }}
        </span>

        <button class="btn btn-ghost settings-btn" @click="showSettings = true">
          <Settings :size="14" aria-hidden="true" />
          ตั้งค่า
        </button>
      </div>
    </header>

    <!-- ═══ Error banner ═══ -->
    <Transition name="slide-down">
      <div v-if="dashStore.error" class="error-banner">
        <AlertTriangle :size="14" aria-hidden="true" />
        {{ dashStore.error }}
        <button class="btn-dismiss" @click="dashStore.error = null" aria-label="ปิด">
          <X :size="12" aria-hidden="true" />
        </button>
      </div>
    </Transition>

    <!-- ═══ No connection prompt ═══ -->
    <div v-if="!dbStore.connected && !dbStore.connecting" class="no-conn-banner">
      <PlugZap :size="14" aria-hidden="true" />
      ยังไม่ได้เชื่อมต่อฐานข้อมูล —
      <button class="link-btn" @click="showSettings = true">คลิกเพื่อตั้งค่าการเชื่อมต่อ</button>
    </div>

    <!-- ═══ Main Layout ═══ -->
    <main class="main-grid">
      <!-- Left: Top Drugs Panel -->
      <aside class="sidebar">
        <TopDrugsPanel @select="onDrugSelect" />
      </aside>

      <!-- Right: KPI + Chart -->
      <section class="content-col">
        <SummaryKpiBar />
        <DrugValueTrendChart />
      </section>
    </main>

    <!-- ═══ Connection Settings Drawer ═══ -->
    <ConnectionSettings
      :visible="showSettings"
      @close="showSettings = false"
      @connected="onConnected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Banana, Settings, AlertTriangle, PlugZap, X } from 'lucide-vue-next'
import { useDbConfigStore } from './stores/dbConfig'
import { useDashboardStore } from './stores/dashboard'
import { useDrugData } from './composables/useDrugData'

import YearSelector from './components/YearSelector.vue'
import DrugSearchBar from './components/DrugSearchBar.vue'
import TopDrugsPanel from './components/TopDrugsPanel.vue'
import SummaryKpiBar from './components/SummaryKpiBar.vue'
import DrugValueTrendChart from './components/DrugValueTrendChart.vue'
import ConnectionSettings from './components/ConnectionSettings.vue'
import type { DrugItem } from './composables/useDrugData'

const dbStore = useDbConfigStore()
const dashStore = useDashboardStore()
const { fetchAvailableYears, fetchDrugMonthlyValue, refreshAll } = useDrugData()

const showSettings = ref(false)

// ─── Lifecycle ───────────────────────────────────────────────

onMounted(async () => {
  // Auto-connect on startup if config is saved
  await dbStore.tryAutoConnect()
  if (dbStore.connected) {
    await onConnected()
  } else {
    // Show settings on first run when no config saved
    if (!dbStore.isConfigured) {
      showSettings.value = true
    }
  }
})

// ─── Handlers ───────────────────────────────────────────────

async function onConnected() {
  await fetchAvailableYears()
  await refreshAll(dashStore.selectedYear)
}

async function onYearChange(year: number) {
  dashStore.currentChartData = null
  await refreshAll(year)
}

async function onDrugSelect(code: string) {
  await fetchDrugMonthlyValue(dashStore.selectedYear, code)
}

async function onDrugSearch(drug: DrugItem) {
  dashStore.setSelectedDrug(drug.working_code)
  await fetchDrugMonthlyValue(dashStore.selectedYear, drug.working_code)
}
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-base);
}

/* ─── Navbar ─────────────────────────────────────────── */

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 56px;
  background: var(--banana-dark);
  color: var(--text-on-primary);
  flex-shrink: 0;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(96, 56, 8, 0.25);
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-green { background: #4ADE80; }
.dot-red   { background: #F87171; }

.brand-icon {
  color: var(--text-on-dark);
  opacity: 0.9;
  flex-shrink: 0;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-on-primary);
  line-height: 1.2;
}

.brand-sub {
  font-size: 11px;
  color: rgba(254, 250, 224, 0.65);
}

.navbar-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
}

.settings-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  color: rgba(254, 250, 224, 0.85);
  border-color: rgba(254, 250, 224, 0.2);
  font-size: 13px;
  padding: 6px 12px;
}

.settings-btn:hover {
  background: rgba(254, 250, 224, 0.1);
  border-color: rgba(254, 250, 224, 0.4);
}

/* ─── Banners ────────────────────────────────────────── */

.error-banner {
  background: rgba(193, 18, 31, 0.08);
  border-bottom: 1px solid rgba(193, 18, 31, 0.2);
  color: var(--status-high);
  font-size: 13px;
  padding: 8px 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: space-between;
  flex-shrink: 0;
}

.btn-dismiss {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--status-high);
  display: flex;
  align-items: center;
  padding: 2px;
}

.no-conn-banner {
  background: rgba(255, 155, 0, 0.1);
  border-bottom: 1px solid rgba(255, 155, 0, 0.3);
  color: #6B4000;
  font-size: 13px;
  padding: 7px 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.link-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--banana-dark);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  text-decoration: underline;
}

/* ─── Main grid ──────────────────────────────────────── */

.main-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 14px;
  padding: 14px;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.sidebar {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.content-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
  min-height: 0;
}

/* ─── Banner transitions ─────────────────────────────── */

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all var(--transition-med);
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 48px;
}
</style>
