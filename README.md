# INVS Dash

```
██╗███╗   ██╗██╗   ██╗ ██████╗██████╗  █████╗  ██████╗██╗  ██╗
██║████╗  ██║██║   ██║██╔════╝██╔══██╗██╔══██╗██╔════╝██║  ██║
██║██╔██╗ ██║██║   ██║███████╗██║  ██║███████║███████╗███████║
██║██║╚██╗██║╚██╗ ██╔╝╚════██║██║  ██║██╔══██║╚════██║██║  ██║
██║██║ ╚████║ ╚████╔╝ ██████╔╝██████╔╝██║  ██║██████╔╝██║  ██║
╚═╝╚═╝  ╚═══╝  ╚═══╝  ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝
```

---

## ◆ PULSE

What the Ministry of Public Health bought is written in INVS; what it
means is written nowhere. INVS Dash reads the SQL Server database -
`MS_IVO`, `MS_IVO_C`, `DRUG_GN` - and answers the procurement question
in Baht: monthly purchase value for any drug, the top ten of the year,
and the KPIs a budget review starts from. A desktop dashboard with a
warm theme for the long analysis sessions, connected read-only, drawn
by ECharts.

| Trend ▣ | Top 10 ▣ | KPIs ▣ | Direct read ▣ |
|---|---|---|---|

*The value view - connect, search, trend, rank - is sealed.*

> Built with Tauri 2 + Vue 3 + TypeScript, drawn by Apache ECharts,
> read from INVS SQL Server through the `tiberius` Rust client.
>
> **suradet-ps**, artifact keeper

---

## ◆ IGNITION

One clone, one install, one command.

```
⟫ git clone https://github.com/suradet-ps/invs-dash.git
⟫ cd invs-dash
⟫ bun install
⟫ bun tauri dev
```

The release artifact: `⟫ bun tauri build`

<details>
<summary>Prerequisites</summary>

- [Node.js](https://nodejs.org) (v18+)
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [Tauri CLI](https://tauri.app/v2/guide/cli/)
- An SQL Server instance with the INVS database

On first launch, the Connection dialog asks for server, port (default
`1433`), username, password, database (`INVS`), and optional named
instance - settings persist locally.

</details>

---

## ◆ ANATOMY

One connection, three tables, several honest charts.

- **Connects** - the settings dialog opens a `tiberius` client to SQL
  Server; the connection is held for questions, never for writes.
- **Reads** - the queries touch exactly three tables: `MS_IVO` invoice
  headers (`RECEIVE_DATE` as `YYYYMMDD` integers), `MS_IVO_C` invoice
  lines (`WORKING_CODE`, `VALUE`), and `DRUG_GN` drug names.
- **Trends** - one drug's monthly purchase value renders as a bar+line
  combo across the year - the shape of spending, not just its total.
- **Ranks** - the top ten drugs by annual purchase value answer "where
  did the money go" in one column.
- **Summarizes** - total purchase value, active item count, and the
  peak month sit in the KPI bar, first glance, no digging.
- **Warms** - the Crispy Banana theme keeps the eyes comfortable across
  an afternoon of analysis - professional warmth, not distraction.

---

## ◆ RITUALS

**The core ceremony** - the monthly value review:

1. Open INVS Dash and connect to the database. One configuration,
   remembered.
2. Pick the year. The KPI bar states the total, the count, and the
   peak month at a glance.
3. Search a drug; its monthly value curve renders, bar over line.
4. Read the top ten. The meeting now knows where the money went.

**The ceremony of the direct read** - no export, no spreadsheet
archaeology: the Rust backend asks SQL Server and ECharts draws the
answer. The number on screen is the number in the database.

**The ceremony of restraint** - the dashboard reads value and never
writes a row. INVS stays the system of record; the dashboard is the
witness, not the clerk.

---

## ◆ ECHOES

**Where this artifact is heading**

```
connect ▸ SQL Server settings, persisted locally ──────────────────── ▸ sealed
read     ▸ MS_IVO, MS_IVO_C, DRUG_GN queries ──────────────────────── ▸ sealed
trend    ▸ monthly value bar+line chart ────────────────────────────── ▸ sealed
rank     ▸ top ten by annual purchase value ────────────────────────── ▸ sealed
summary  ▸ KPIs: total, active count, peak month ───────────────────── ▸ sealed
```

**Raising the artifact** - the ground rules live in `AGENTS.md` and
`AGENTS-RUST.md`. Open an issue first to discuss a change.

**Status** - this artifact ships from source; releases are built with
`bun tauri build`.

---

```
  ─────────────────────────────────────────
   A purchase value without a shape
   is a number without a story.
  ─────────────────────────────────────────
```

[MIT](LICENSE)
