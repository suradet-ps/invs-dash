import { invoke } from '@tauri-apps/api/core'
import { useDashboardStore, type DrugMonthlyValue, type DrugValueSummary, type YearSummary } from '../stores/dashboard'

export interface DrugItem {
  working_code: string
  drug_name: string
}

export function useDrugData() {
  const store = useDashboardStore()

  async function fetchAvailableYears(): Promise<number[]> {
    try {
      const years = await invoke<number[]>('get_available_years')
      store.availableYears = years
      return years
    } catch (err) {
      store.error = String(err)
      return []
    }
  }

  async function fetchTopDrugs(year: number, limit = 10): Promise<DrugValueSummary[]> {
    store.loading = true
    store.error = null
    try {
      const drugs = await invoke<DrugValueSummary[]>('get_top_drugs_by_value', {
        year,
        limit,
      })
      store.topDrugs = drugs
      return drugs
    } catch (err) {
      store.error = String(err)
      return []
    } finally {
      store.loading = false
    }
  }

  async function fetchDrugMonthlyValue(
    year: number,
    workingCode: string
  ): Promise<DrugMonthlyValue | null> {
    store.loadingChart = true
    store.error = null
    try {
      const data = await invoke<DrugMonthlyValue>('get_drug_monthly_value', {
        year,
        workingCode,
      })
      store.currentChartData = data
      return data
    } catch (err) {
      store.error = String(err)
      return null
    } finally {
      store.loadingChart = false
    }
  }

  async function fetchYearSummary(year: number): Promise<YearSummary | null> {
    try {
      const summary = await invoke<YearSummary>('get_year_summary', { year })
      store.yearSummary = summary
      return summary
    } catch (err) {
      store.error = String(err)
      return null
    }
  }

  async function searchDrugs(query: string): Promise<DrugItem[]> {
    if (!query.trim()) return []
    try {
      return await invoke<DrugItem[]>('get_drug_list', { search: query })
    } catch (err) {
      store.error = String(err)
      return []
    }
  }

  async function refreshAll(year: number) {
    await Promise.all([
      fetchTopDrugs(year),
      fetchYearSummary(year),
    ])
    // If a drug was already selected, reload its chart
    if (store.selectedWorkingCode) {
      await fetchDrugMonthlyValue(year, store.selectedWorkingCode)
    }
  }

  return {
    fetchAvailableYears,
    fetchTopDrugs,
    fetchDrugMonthlyValue,
    fetchYearSummary,
    searchDrugs,
    refreshAll,
  }
}
