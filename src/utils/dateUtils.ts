/** Parse an integer YYYYMMDD date (used in INVS) into a JS Date. */
export function parseInvsDate(yyyymmdd: number): Date {
  const str = String(yyyymmdd).padStart(8, '0')
  const year = parseInt(str.slice(0, 4), 10)
  const month = parseInt(str.slice(4, 6), 10) - 1
  const day = parseInt(str.slice(6, 8), 10)
  return new Date(year, month, day)
}

// ─── Calendar month arrays (index 0 = January) ───────────────────────────────

export const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
]

export const THAI_MONTHS_LONG = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]

// ─── Fiscal Year (ปีงบประมาณ) ─────────────────────────────────────────────────
// FY N = 1 ต.ค. (N-1) ถึง 30 ก.ย. N
// Fiscal month 1 = ต.ค., 2 = พ.ย., ..., 3 = ธ.ค., 4 = ม.ค., ..., 12 = ก.ย.

/** Thai short month names in fiscal-year order (index 0 = fiscal month 1 = ต.ค.) */
export const FISCAL_MONTHS_SHORT = [
  'ต.ค.', 'พ.ย.', 'ธ.ค.',           // months 10,11,12  → fiscal 1,2,3
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', // months  1, 2, 3, 4 → fiscal 4,5,6,7
  'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', // 5-9 → 8-12
]

/** Thai long month names in fiscal-year order */
export const FISCAL_MONTHS_LONG = [
  'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน',
]

/**
 * Convert a calendar month (1–12) to fiscal month index (0-based).
 * Oct=0, Nov=1, Dec=2, Jan=3, ..., Sep=11
 */
export function calendarMonthToFiscalIndex(calMonth: number): number {
  // calMonth 10→0, 11→1, 12→2, 1→3, 2→4, ..., 9→11
  return calMonth >= 10 ? calMonth - 10 : calMonth + 2
}

/**
 * Convert a fiscal month index (0-based, 0=Oct) back to calendar month (1–12).
 */
export function fiscalIndexToCalendarMonth(fIdx: number): number {
  return fIdx < 3 ? fIdx + 10 : fIdx - 2
}

/**
 * Return the current Thai fiscal year.
 * If today's month >= October → fiscal year = next CE year.
 * Otherwise → fiscal year = current CE year.
 */
export function currentFiscalYear(): number {
  const now = new Date()
  const month = now.getMonth() + 1  // 1-based
  const year = now.getFullYear()
  return month >= 10 ? year + 1 : year
}

/** Format a number as Thai Baht with thousands separator. */
export function formatBaht(value: number, decimals = 0): string {
  return '฿' + value.toLocaleString('th-TH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}
