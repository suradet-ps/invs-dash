<template>
  <div class="chart-card card">
    <!-- Header -->
    <div class="chart-header">
      <div class="chart-title-group">
        <span v-if="data" class="chart-drug-code font-mono">{{ data.working_code }}</span>
        <span class="chart-title">
          {{ data ? (data.drug_name || data.working_code) : 'เลือกรายการยาเพื่อดูแนวโน้ม' }}
        </span>
      </div>
      <div v-if="data" class="chart-total">
        มูลค่ารวม:
        <span class="chart-total-value font-display">{{ formatBaht(data.total_value) }}</span>
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="dashStore.loadingChart" class="chart-loading">
      <div class="skeleton" style="width: 100%; height: 100%; border-radius: 8px;" />
    </div>

    <!-- Empty / no drug selected -->
    <div v-else-if="!data" class="chart-empty">
      <BarChart2 :size="44" class="chart-empty-icon" />
      <p>คลิกชื่อยาในรายการทางซ้าย<br />หรือค้นหายาเพื่อดูกราฟแนวโน้ม</p>
    </div>

    <!-- ECharts -->
    <v-chart
      v-else
      class="echarts-canvas"
      :option="chartOption"
      :autoresize="true"
      :update-options="{ notMerge: true }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { BarChart2 } from 'lucide-vue-next'
import { useDashboardStore } from '../stores/dashboard'
import { formatBaht, FISCAL_MONTHS_SHORT } from '../utils/dateUtils'

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
])

const dashStore = useDashboardStore()
const data = computed(() => dashStore.currentChartData)

// Bar colours — peak fiscal month gets accent, others get primary
const barColors = computed(() => {
  if (!data.value) return []
  const peakIdx = data.value.peak_month - 1
  return data.value.monthly_value.map((_, i) =>
    i === peakIdx ? '#FF9B00' : '#D4A373'
  )
})

// 3-month moving average as trend line
function movingAvg(vals: number[], window = 3): (number | null)[] {
  return vals.map((_, i) => {
    const start = Math.max(0, i - window + 1)
    const slice = vals.slice(start, i + 1)
    return slice.reduce((a, b) => a + b, 0) / slice.length
  })
}

const chartOption = computed(() => {
  if (!data.value) return {}
  const vals = data.value.monthly_value
  const total = data.value.total_value || 1

  return {
    backgroundColor: 'transparent',
    grid: {
      left: 16,
      right: 16,
      top: 20,
      bottom: 40,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#2D1E0F',
      borderColor: '#4A2800',
      borderWidth: 1,
      textStyle: { color: '#FEFAE0', fontFamily: 'Sarabun, Tahoma, sans-serif', fontSize: 13 },
      formatter(params: { name: string; seriesName: string; value: number }[]) {
        const bar = params.find((p) => p.seriesName === 'มูลค่ารายเดือน')
        const line = params.find((p) => p.seriesName === 'ค่าเฉลี่ยเคลื่อนที่')
        const val = bar?.value ?? 0
        const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0'
        let tip = `<b>${params[0]?.name}</b><br/>`
        tip += `มูลค่า: <b>${formatBaht(val)}</b> (${pct}%)<br/>`
        if (line) tip += `เฉลี่ย 3 เดือน: ${formatBaht(line.value ?? 0)}`
        return tip
      },
    },
    legend: {
      bottom: 0,
      right: 'center',
      itemGap: 24,
      textStyle: { color: '#5C3D1E', fontFamily: 'Sarabun, Tahoma, sans-serif', fontSize: 12 },
    },
    xAxis: {
      type: 'category',
      data: FISCAL_MONTHS_SHORT,   // ต.ค. → ก.ย.
      axisLine: { lineStyle: { color: 'rgba(74,40,0,0.2)' } },
      axisLabel: {
        color: '#5C3D1E',
        fontFamily: 'Sarabun, Tahoma, sans-serif',
        fontSize: 11,
      },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(74,40,0,0.08)', type: 'dashed' } },
      axisLabel: {
        color: '#7A5535',
        fontFamily: 'Sarabun, Tahoma, sans-serif',
        fontSize: 11,
        formatter: (v: number) =>
          v >= 1_000_000
            ? '฿' + (v / 1_000_000).toFixed(1) + 'M'
            : v >= 1_000
            ? '฿' + (v / 1_000).toFixed(0) + 'K'
            : '฿' + v,
      },
    },
    series: [
      {
        name: 'มูลค่ารายเดือน',
        type: 'bar',
        data: vals.map((v, i) => ({
          value: v,
          itemStyle: { color: barColors.value[i], borderRadius: [4, 4, 0, 0] },
        })),
        barMaxWidth: 40,
        animationEasing: 'cubicOut',
        animationDuration: 700,
      },
      {
        name: 'ค่าเฉลี่ยเคลื่อนที่',
        type: 'line',
        data: movingAvg(vals),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#4A2800', width: 2 },
        itemStyle: { color: '#4A2800' },
        animationEasing: 'cubicOut',
        animationDuration: 900,
      },
    ],
  }
})
</script>

<style scoped>
.chart-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  overflow: hidden;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 10px;
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
  gap: 12px;
}

.chart-title-group {
  display: flex;
  align-items: baseline;
  gap: 10px;
  overflow: hidden;
  min-width: 0;
}

.chart-drug-code {
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-elevated);
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.chart-title {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--banana-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chart-total {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
}

.chart-total-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--banana-dark);
  margin-left: 4px;
}

.echarts-canvas {
  flex: 1;
  min-height: 0;
  padding: 8px 12px 4px;
}

.chart-loading {
  flex: 1;
  padding: 16px;
}

.chart-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-muted);
  text-align: center;
  font-size: 14px;
  line-height: 1.7;
}

.chart-empty-icon {
  color: var(--banana-primary);
  opacity: 0.6;
}
</style>
