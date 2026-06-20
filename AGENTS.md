# AGENTS.md — INVS Dash

> **Stack**: Tauri 2 (Rust) + Vue 3 (TypeScript) + Vite  
> **Theme**: Crispy Banana Siam — warm parchment background, golden banana accents, caramel depth  
> **Data Source**: INVS (SQL Server) — Drug receiving/purchase value analytics

---

## 🎯 Project Goal

Build a desktop dashboard that connects to an INVS SQL Server database and visualizes **monthly drug purchase values** per drug item, displayed as beautiful trend charts across 12 months of a selected year. The metric is monetary value (VALUE), not quantity.

---

## 📁 Project Structure

```
invs-dash/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs          # Tauri app entry point
│   │   ├── lib.rs           # lib entry (Tauri 2 style)
│   │   ├── db.rs            # tiberius SQL Server pool + query logic
│   │   └── commands.rs      # Tauri commands exposed to frontend
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── components/
│   │   ├── YearSelector.vue          # Year picker dropdown
│   │   ├── DrugSearchBar.vue         # Drug search/filter by WORKING_CODE or name
│   │   ├── DrugValueTrendChart.vue   # Monthly bar+line combo chart per drug
│   │   ├── TopDrugsPanel.vue         # Top N drugs by total VALUE this year
│   │   ├── SummaryKpiBar.vue         # Total value, unique drugs, peak month
│   │   └── ConnectionSettings.vue   # DB host/user/pass/instance config modal
│   ├── stores/
│   │   ├── dbConfig.ts       # Pinia: SQL Server connection config (persisted)
│   │   └── dashboard.ts      # Pinia: year, selected drug, chart data
│   ├── composables/
│   │   └── useDrugData.ts    # Composable wrapping Tauri invoke calls
│   ├── styles/
│   │   └── banana-theme.css  # CSS variables for Crispy Banana palette
│   └── utils/
│       └── dateUtils.ts      # YYYYMMDD integer date parsing helpers
├── package.json
└── vite.config.ts
```

---

## 🎨 Design System — Crispy Banana Siam Theme

### Philosophy

Light-mode dashboard optimized for long reading sessions. Warm parchment base reduces eye strain; golden banana accents draw attention to critical KPIs; caramel tones provide depth without harshness. The aesthetic is professional yet approachable — appropriate for pharmacists and procurement staff.

### Color Palette (`banana-theme.css`)

```css
:root {
  /* Backgrounds */
  --bg-base:         #FEFAE0;   /* Greasy paper — main app background */
  --bg-surface:      #F1EAD3;   /* Card / table row alternate */
  --bg-elevated:     #E8DFC4;   /* Elevated panels, dropdowns */

  /* Crispy Banana accents */
  --banana-primary:  #D4A373;   /* Fried batter — primary buttons, headers */
  --banana-accent:   #FFB703;   /* Ripe banana flesh — high-value highlights, chart peaks */
  --banana-dark:     #603808;   /* Caramel syrup — chart lines, borders, strong emphasis */
  --banana-leaf:     #CCD5AE;   /* Raw banana peel — secondary surface, table headers alt */

  /* Status colors */
  --status-high:     #E63946;   /* Burnt banana — high value warning */
  --status-normal:   #A8A355;   /* Dried banana leaf — normal/OK status */
  --status-low:      #8EAFC2;   /* Cool blue — low activity */

  /* Text */
  --text-primary:    #402E32;   /* Dark brown-black — main readable text */
  --text-secondary:  #7A5C42;   /* Mid-caramel — labels, secondary info */
  --text-muted:      #B09A82;   /* Light caramel — placeholders, disabled */
  --text-on-primary: #FEFAE0;   /* Parchment on dark buttons */

  /* Chart */
  --chart-bar:       #D4A373;   /* Primary bars */
  --chart-bar-peak:  #FFB703;   /* Accent for highest month bar */
  --chart-line:      #603808;   /* Trend line */
  --chart-area:      rgba(212, 163, 115, 0.2); /* Area fill */
  --chart-grid:      rgba(96, 56, 8, 0.08);    /* Grid lines */

  /* Table */
  --table-header-bg: #D4A373;
  --table-header-text: #FEFAE0;
  --table-row-alt:   #F1EAD3;

  /* Borders & shadows */
  --border-subtle:   rgba(96, 56, 8, 0.12);
  --border-active:   rgba(212, 163, 115, 0.6);
  --shadow-card:     0 2px 12px rgba(96, 56, 8, 0.08);
  --shadow-hover:    0 4px 20px rgba(212, 163, 115, 0.25);
}
```

### Typography

- **Display / KPI values**: `Playfair Display` (Google Fonts) — editorial gravitas for large currency numbers
- **UI labels / body**: `Sarabun` (Google Fonts) — Thai-compatible, clean, professional; replaces Tahoma
- **Drug codes / data fields**: `JetBrains Mono` — monospace for WORKING_CODE and invoice numbers

### Motion & Effects

- Page load: cards fade-in + slide-up with staggered `animation-delay`
- Chart bars: grow from baseline on data load (CSS `@keyframes growUp`)
- Peak month bar: rendered in `--banana-accent` (#FFB703) instead of default bar color
- Card hover: `box-shadow` transitions to `--shadow-hover`
- Table rows: subtle background transition on hover

---

## 🦀 Rust Backend (Tauri Commands)

### Dependencies (`Cargo.toml`)

```toml
[dependencies]
tauri = { version = "2", features = [] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tiberius = { version = "0.12", features = ["tokio", "rustls"] }
tokio = { version = "1", features = ["full"] }
tokio-util = { version = "0.7", features = ["compat"] }
once_cell = "1"
futures = "0.3"
```

> **Why `rustls`?** Avoids native TLS dependencies for easier cross-platform builds. If the SQL Server requires `ENCRYPTION=OFF`, configure `tiberius::Config` accordingly.

### Database Connection (`src-tauri/src/db.rs`)

Use `tiberius::Client` wrapped in an `Arc<Mutex<Client<Compat<TcpStream>>>>` stored in a Tauri-managed state struct.

```rust
// Connection config struct
pub struct InvsDbConfig {
    pub host: String,        // e.g. "192.168.1.10"
    pub port: u16,           // default: 1433
    pub user: String,
    pub password: String,
    pub database: String,    // e.g. "INVS"
    pub instance: Option<String>, // SQL Server named instance if needed
}

// State wrapper managed by Tauri
pub struct DbState(pub Arc<Mutex<Option<Client<Compat<TcpStream>>>>>);
```

Connection setup pattern:
1. Build `tiberius::Config` from `InvsDbConfig`
2. Set `config.encryption(tiberius::EncryptionLevel::NotSupported)` for typical hospital LAN setup
3. `TcpStream::connect()` → wrap with `tokio_util::compat::TokioAsyncWriteCompatExt`
4. `Client::connect(config, tcp_stream.compat_write())` 
5. Store client in `DbState`

### Tauri Commands (`src-tauri/src/commands.rs`)

All commands take `state: tauri::State<'_, DbState>` as parameter.

---

#### `connect_invs_db`

```
Input:  InvsDbConfig { host, port, user, password, database, instance }
Action: Initialize tiberius client, store in managed state
Output: Result<(), String>
```

---

#### `get_drug_monthly_value`

```
Input:  year: u16, working_code: String
Output: DrugMonthlyValue

DrugMonthlyValue {
  working_code: String,
  drug_name: String,
  monthly_value: [f64; 12],  // index 0 = January (month 1), 11 = December
  total_value: f64,
  peak_month: u8,            // 1-12
}

SQL logic:
  SELECT
    c.WORKING_CODE,
    g.DRUG_NAME,
    MONTH(CAST(CAST(h.RECEIVE_DATE AS VARCHAR(8)) AS DATE)) AS month,
    SUM(c.VALUE) AS total_value
  FROM MS_IVO_C c
  JOIN MS_IVO h ON c.INVOICE_NO = h.INVOICE_NO
  LEFT JOIN DRUG_GN g ON c.WORKING_CODE = g.WORKING_CODE
  WHERE
    c.WORKING_CODE = @P1
    AND LEFT(CAST(h.RECEIVE_DATE AS VARCHAR(8)), 4) = @P2
  GROUP BY
    c.WORKING_CODE, g.DRUG_NAME,
    MONTH(CAST(CAST(h.RECEIVE_DATE AS VARCHAR(8)) AS DATE))
  ORDER BY month
```

---

#### `get_top_drugs_by_value`

```
Input:  year: u16, limit: u8 (default 10)
Output: Vec<DrugValueSummary>

DrugValueSummary {
  working_code: String,
  drug_name: String,
  total_value: f64,
  peak_month: u8,
  peak_month_value: f64,
}

Sorted by total_value DESC.
```

---

#### `get_available_years`

```
Output: Vec<u16>

SQL:
  SELECT DISTINCT LEFT(CAST(RECEIVE_DATE AS VARCHAR(8)), 4) AS yr
  FROM MS_IVO
  ORDER BY yr DESC
```

---

#### `get_drug_list`

```
Input:  search: String (matches WORKING_CODE prefix or DRUG_NAME contains)
Output: Vec<DrugItem> { working_code: String, drug_name: String }

SQL:
  SELECT TOP 30 g.WORKING_CODE, g.DRUG_NAME
  FROM DRUG_GN g
  WHERE g.WORKING_CODE LIKE @P1 + '%'
     OR g.DRUG_NAME LIKE '%' + @P1 + '%'
  ORDER BY g.WORKING_CODE

Used for autocomplete in DrugSearchBar.
```

---

### Date Handling in SQL

`RECEIVE_DATE` in `MS_IVO` is stored as an integer in `YYYYMMDD` format (e.g., `20251016`).

**Conversion strategy in T-SQL:**
```sql
-- Cast integer to 8-char string, then to DATE
CAST(CAST(RECEIVE_DATE AS VARCHAR(8)) AS DATE)
-- Then use standard YEAR(), MONTH() functions

-- Extract year as string for WHERE clause:
LEFT(CAST(RECEIVE_DATE AS VARCHAR(8)), 4) = '2025'

-- Extract month:
MONTH(CAST(CAST(RECEIVE_DATE AS VARCHAR(8)) AS DATE))
```

**In Rust (tiberius):** Pass year as `&str` parameter (e.g., `"2025"`) for the `LEFT(...) = @P1` pattern. tiberius parameters are positional `@P1`, `@P2`, etc.

---

## 🖼️ Frontend Components

### `App.vue` — Layout Shell

```
┌─────────────────────────────────────────────────────────┐
│  🍌 INVS Dash                        [⚙ Connection]   │
│  ─────────────────────────────────────────────────────  │
│  [ Year: 2025 ▼ ]   [ 🔍 Search drug or code... ]       │
├──────────────┬──────────────────────────────────────────┤
│ Top 10 Drugs │  ┌─────────┬─────────┬─────────┐         │
│  by Value    │  │Total Val│ Drugs # │Peak Mon.│  KPIs   │
│              │  └─────────┴─────────┴─────────┘         │
│ [Drug A ████]│  ─────────────────────────────────────── │
│ [Drug B ███ ]│                                           │
│ [Drug C ██  ]│   Drug Value Trend Chart                  │
│ [Drug D █   ]│   (selected drug — 12-month bar+line)     │
│     ...      │                                           │
└──────────────┴──────────────────────────────────────────┘
```

### `DrugValueTrendChart.vue`

- Library: **Apache ECharts** via `vue-echarts`
- Chart type: **Bar** (monthly value) + **Line overlay** (trend/moving average)
- X-axis: Thai short month names — ม.ค., ก.พ., มี.ค., เม.ย., พ.ค., มิ.ย., ก.ค., ส.ค., ก.ย., ต.ค., พ.ย., ธ.ค.
- Y-axis: Thai Baht value with `toLocaleString('th-TH')` formatting (e.g., `฿1,234,500`)
- Peak bar: rendered in `--banana-accent` (#FFB703), others in `--banana-primary`
- Tooltip: show exact value + % of annual total on hover
- Animation: bars grow from baseline on data change (`animationEasing: 'cubicOut'`)
- Zero months: render as empty bar with dashed indicator

### `TopDrugsPanel.vue`

- Vertical ranked list, top 10 drugs by total VALUE for the selected year
- Each row:
  - Rank number (styled with `--banana-dark`)
  - Drug name (Sarabun, truncated with tooltip on overflow)
  - WORKING_CODE (JetBrains Mono, muted)
  - Horizontal mini progress bar (relative to #1 drug)
  - Total value formatted as ฿ with thousands separator
- Click any row → selects that drug, updates DrugValueTrendChart
- Active drug: row highlighted with `--banana-leaf` background + left border in `--banana-accent`

### `SummaryKpiBar.vue`

Three KPI cards displayed horizontally:

| Card | Metric | Detail |
|------|--------|--------|
| **Total Purchase Value** | Sum of all VALUE for the year | Large Playfair Display number, ฿ prefix |
| **Active Drug Items** | Count of unique WORKING_CODE with value > 0 | Count with "รายการ" label |
| **Peak Month** | Month with highest total purchase value | Thai month name + value |

Card design: `--bg-surface` background, `--banana-primary` left accent border, subtle `--shadow-card`.

### `ConnectionSettings.vue`

- Slide-in drawer (right side) for SQL Server connection config:
  - Server / Host IP
  - Port (default: 1433)
  - Username
  - Password (masked)
  - Database name (default: `INVS`)
  - Named Instance (optional)
- "Test Connection" button → calls `connect_invs_db`, shows result inline
- Settings persisted to `localStorage`
- Connection status badge in app header: 🟢 Connected / 🔴 Disconnected

### `YearSelector.vue`

- Dropdown populated by `get_available_years` result
- Defaults to current CE year on first load
- Changing year triggers full dashboard refresh

### `DrugSearchBar.vue`

- Debounced input (300ms) calling `get_drug_list`
- Dropdown autocomplete showing WORKING_CODE + DRUG_NAME
- Selecting a drug updates the chart directly (bypasses TopDrugsPanel selection)

---

## 📦 Frontend Dependencies

```json
{
  "dependencies": {
    "vue": "^3.5",
    "pinia": "^2.1",
    "@tauri-apps/api": "^2",
    "echarts": "^5.5",
    "vue-echarts": "^7"
  },
  "devDependencies": {
    "typescript": "^5",
    "vite": "^7",
    "@vitejs/plugin-vue": "^5",
    "@tauri-apps/cli": "^2"
  }
}
```

> **Google Fonts to include in `index.html`:**  
> `Playfair+Display:wght@700;900` + `Sarabun:wght@400;500;600` + `JetBrains+Mono:wght@400`

---

## 🗃️ Pinia Stores

### `dbConfig.ts`

```ts
interface InvsDbConfig {
  host: string          // default: "localhost"
  port: number          // default: 1433
  user: string
  password: string
  database: string      // default: "INVS"
  instance: string      // optional named instance
  connected: boolean
}
```

Persisted to `localStorage`. Attempts `connect_invs_db` on app startup if config present.

### `dashboard.ts`

```ts
interface DashboardState {
  selectedYear: number               // default: current CE year
  availableYears: number[]
  selectedWorkingCode: string | null
  topDrugs: DrugValueSummary[]
  currentChartData: DrugMonthlyValue | null
  loading: boolean
  error: string | null
}
```

---

## 🧩 Composable: `useDrugData.ts`

```ts
export function useDrugData() {
  async function fetchTopDrugs(year: number, limit = 10): Promise<DrugValueSummary[]>
  async function fetchDrugMonthlyValue(year: number, workingCode: string): Promise<DrugMonthlyValue>
  async function fetchAvailableYears(): Promise<number[]>
  async function searchDrugs(query: string): Promise<DrugItem[]>
}
// All functions wrap invoke() with loading/error state management
```

---

## 🛠️ Development Steps (for AI agents)

### Phase 1 — Tauri + SQL Server Foundation
1. Scaffold Tauri 2 + Vue 3: `npm create tauri-app`
2. Add `tiberius`, `tokio`, `tokio-util`, `futures` to `Cargo.toml`
3. Implement `db.rs`: `InvsDbConfig` struct, `DbState` managed state, connection logic
4. Implement all 4 commands in `commands.rs`
5. Register commands + `DbState` in `lib.rs` via `.manage()` and `.invoke_handler()`
6. Test each command against INVS dev database

### Phase 2 — Vue Frontend Shell
1. Set up Pinia stores (`dbConfig`, `dashboard`)
2. Build `ConnectionSettings.vue` + test connection flow (end-to-end)
3. Create `banana-theme.css` with all CSS variables
4. Build `App.vue` two-column layout grid
5. Add Google Fonts link in `index.html`

### Phase 3 — Charts & Data
1. Implement `useDrugData.ts` composable
2. Build `TopDrugsPanel.vue` with mini bars and click selection
3. Build `DrugValueTrendChart.vue` (ECharts bar+line, Thai months, ฿ formatting)
4. Build `SummaryKpiBar.vue` with three KPI cards
5. Wire `YearSelector.vue` to trigger full data refresh

### Phase 4 — Polish & UX
1. Apply Crispy Banana theme fully across all components
2. Add loading skeleton states (animated placeholder bars/cards)
3. Add graceful error states: DB disconnect banner, no-data empty state
4. Implement `DrugSearchBar.vue` autocomplete
5. Add peak-month bar coloring logic in chart
6. Test with real INVS data; tune SQL performance if needed

---

## 🧪 SQL Reference

### Monthly purchase value by drug for a given year

```sql
SELECT
    c.WORKING_CODE,
    g.DRUG_NAME,
    MONTH(CAST(CAST(h.RECEIVE_DATE AS VARCHAR(8)) AS DATE)) AS month,
    SUM(c.VALUE) AS total_value
FROM MS_IVO_C c
JOIN MS_IVO h ON c.INVOICE_NO = h.INVOICE_NO
LEFT JOIN DRUG_GN g ON c.WORKING_CODE = g.WORKING_CODE
WHERE
    c.WORKING_CODE = 'XXXXX'
    AND LEFT(CAST(h.RECEIVE_DATE AS VARCHAR(8)), 4) = '2025'
GROUP BY
    c.WORKING_CODE,
    g.DRUG_NAME,
    MONTH(CAST(CAST(h.RECEIVE_DATE AS VARCHAR(8)) AS DATE))
ORDER BY month;
```

### Top drugs by total value for a year

```sql
SELECT TOP 10
    c.WORKING_CODE,
    g.DRUG_NAME,
    SUM(c.VALUE) AS total_value
FROM MS_IVO_C c
JOIN MS_IVO h ON c.INVOICE_NO = h.INVOICE_NO
LEFT JOIN DRUG_GN g ON c.WORKING_CODE = g.WORKING_CODE
WHERE LEFT(CAST(h.RECEIVE_DATE AS VARCHAR(8)), 4) = '2025'
GROUP BY c.WORKING_CODE, g.DRUG_NAME
ORDER BY total_value DESC;
```

### Available years

```sql
SELECT DISTINCT
    LEFT(CAST(RECEIVE_DATE AS VARCHAR(8)), 4) AS yr
FROM MS_IVO
ORDER BY yr DESC;
```

### Drug search autocomplete

```sql
SELECT TOP 30
    g.WORKING_CODE,
    g.DRUG_NAME
FROM DRUG_GN g
WHERE
    g.WORKING_CODE LIKE 'ABC%'
    OR g.DRUG_NAME LIKE '%ABC%'
ORDER BY g.WORKING_CODE;
```

---

## ⚠️ Key Constraints & Notes

| Topic | Detail |
|-------|--------|
| Date format | `RECEIVE_DATE` in `MS_IVO` is `INT` in `YYYYMMDD` format — cast to `VARCHAR(8)` then to `DATE` for `MONTH()`/`YEAR()` |
| Join key | `MS_IVO_C.INVOICE_NO` → `MS_IVO.INVOICE_NO` for date lookup |
| Drug name | Join `DRUG_GN` on `WORKING_CODE` for `DRUG_NAME` |
| tiberius params | Positional: `@P1`, `@P2`, ... — pass year as `&str`, working_code as `&str` |
| Encryption | Set `config.encryption(EncryptionLevel::NotSupported)` for typical hospital LAN without TLS |
| Currency | `VALUE` field may be `DECIMAL`/`FLOAT` in SQL Server — deserialize as `f64` in Rust |
| Tauri state | Use `.manage(DbState(...))` in `lib.rs`; commands receive `State<'_, DbState>` |
| Error handling | All commands return `Result<T, String>`; frontend handles errors in composable |
| No CE/BE offset | `RECEIVE_DATE` is in CE year — no Buddhist Era adjustment needed |

---

## 🍌 Visual Inspiration

The **Crispy Banana Siam** aesthetic is warm, professional, and distinctly Thai:
- Parchment background (#FEFAE0) like fresh banana-leaf wrapping paper — soft on the eyes during long analysis sessions
- Golden banana accents (#FFB703) make peak values literally glow on screen
- Caramel depth (#603808) grounds the interface with authority — numbers are serious
- Table headers in fried-batter brown (#D4A373) with cream text feel structured yet inviting
- The overall mood: a hospital pharmacy office in the morning, warm light, data that tells a clear story

---

*Generated for: โรงพยาบาลสระโบสถ์ INVS Dash*  
*Stack: Tauri 2 + Vue 3 + TypeScript + tiberius (SQL Server)*