import { defineStore } from 'pinia'
import { ref } from 'vue'
import { currentFiscalYear } from '../utils/dateUtils'

export interface DrugMonthlyValue {
  working_code: string
  drug_name: string
  monthly_value: number[]   // 12 elements, index 0 = ต.ค. (fiscal month 1)
  total_value: number
  peak_month: number        // 1–12 (fiscal: 1=ต.ค., 12=ก.ย.)
}

export interface DrugValueSummary {
  working_code: string
  drug_name: string
  total_value: number
  peak_month: number
  peak_month_value: number
}

export interface YearSummary {
  total_value: number
  unique_drug_count: number
  peak_month: number
  peak_month_value: number
}

export const useDashboardStore = defineStore('dashboard', () => {
  const selectedYear = ref<number>(currentFiscalYear())
  const availableYears = ref<number[]>([])
  const selectedWorkingCode = ref<string | null>(null)

  const topDrugs = ref<DrugValueSummary[]>([])
  const currentChartData = ref<DrugMonthlyValue | null>(null)
  const yearSummary = ref<YearSummary | null>(null)

  const loading = ref(false)
  const loadingChart = ref(false)
  const error = ref<string | null>(null)

  function setYear(year: number) {
    selectedYear.value = year
  }

  function setSelectedDrug(code: string | null) {
    selectedWorkingCode.value = code
  }

  return {
    selectedYear,
    availableYears,
    selectedWorkingCode,
    topDrugs,
    currentChartData,
    yearSummary,
    loading,
    loadingChart,
    error,
    setYear,
    setSelectedDrug,
  }
})
