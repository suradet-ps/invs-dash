# INVS Dash

[![Tauri](https://img.shields.io/badge/Tauri%202-blue?logo=tauri)](https://tauri.app)
[![Vue](https://img.shields.io/badge/Vue%203-green?logo=vue.js)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7-purple?logo=vite)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A desktop dashboard application for analyzing **monthly drug purchase values** from the INVS SQL Server database. Built with Tauri 2 + Vue 3 + TypeScript + Apache ECharts.

---

## Features

- **Drug Value Trend Chart** — Visualize monthly purchase value (Baht) for any drug item as a bar+line combo chart
- **Top Drugs by Value** — Ranked list of top 10 drugs by total annual purchase value
- **Summary KPIs** — Total purchase value, active drug items count, and peak month at a glance
- **Drug Search** — Autocomplete search by drug code or name
- **Year Selector** — Filter data across available years
- **Crispy Banana Theme** — Warm, professional UI optimized for long analysis sessions

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop Framework | [Tauri 2](https://tauri.app) |
| Frontend | [Vue 3](https://vuejs.org) + [TypeScript](https://www.typescriptlang.org) |
| Build Tool | [Vite 7](https://vitejs.dev) |
| State Management | [Pinia](https://pinia.vuejs.org) |
| Charts | [Apache ECharts](https://echarts.apache.org) via [vue-echarts](https://github.com/ecomfe/vue-echarts) |
| Database | SQL Server (via [tiberius](https://github.com/prisma/tiberius) Rust client) |

---

## Prerequisites

- [Node.js](https://nodejs.org) (v18+)
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [Tauri CLI](https://tauri.app/v2/guide/cli/)
- SQL Server instance (INVS database)

---

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Run in development mode

```bash
bun tauri dev
```

### 3. Build for production

```bash
bun tauri build
```

---

## Configuration

On first launch, click the **⚙ Connection** button in the top-right corner to configure your SQL Server connection:

| Field | Description | Default |
|-------|-------------|---------|
| Server / Host | SQL Server IP or hostname | `localhost` |
| Port | SQL Server port | `1433` |
| Username | Database username | — |
| Password | Database password | — |
| Database | Database name | `INVS` |
| Instance | Named instance (optional) | — |

Connection settings are persisted to local storage.

---

## Project Structure

```
invs-dash/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs          # Tauri app entry
│   │   ├── lib.rs           # Tauri 2 lib entry
│   │   ├── db.rs            # SQL Server connection & queries
│   │   └── commands.rs      # Tauri commands exposed to frontend
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/
│   ├── App.vue              # Main layout
│   ├── components/          # Vue components
│   ├── stores/              # Pinia stores
│   ├── composables/         # Vue composables
│   └── styles/              # Crispy Banana theme
├── package.json
└── vite.config.ts
```

---

## SQL Server Schema

The app queries the following tables:

- **`MS_IVO`** — Invoice header (contains `RECEIVE_DATE` as `INT` in `YYYYMMDD` format)
- **`MS_IVO_C`** — Invoice items (`WORKING_CODE`, `VALUE`, `INVOICE_NO`)
- **`DRUG_GN`** — Drug master data (`WORKING_CODE`, `DRUG_NAME`)

---

## License

[MIT](LICENSE)
