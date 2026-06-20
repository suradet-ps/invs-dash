import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'

export interface InvsDbConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
  instance: string
}

const STORAGE_KEY = 'invs_db_config'

function loadFromStorage(): InvsDbConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as InvsDbConfig
  } catch { /* ignore */ }
  return { host: 'localhost', port: 1433, user: '', password: '', database: 'INVS', instance: '' }
}

export const useDbConfigStore = defineStore('dbConfig', () => {
  const config = ref<InvsDbConfig>(loadFromStorage())
  const connected = ref(false)
  const connecting = ref(false)
  const connectionError = ref<string | null>(null)

  const isConfigured = computed(
    () => config.value.host.trim() !== '' && config.value.user.trim() !== ''
  )

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config.value))
  }

  function updateConfig(partial: Partial<InvsDbConfig>) {
    config.value = { ...config.value, ...partial }
    saveToStorage()
  }

  async function connect(): Promise<boolean> {
    if (connecting.value) return false
    connecting.value = true
    connectionError.value = null
    try {
      await invoke('connect_invs_db', { cfg: config.value })
      connected.value = true
      return true
    } catch (err) {
      connectionError.value = String(err)
      connected.value = false
      return false
    } finally {
      connecting.value = false
    }
  }

  async function tryAutoConnect() {
    if (isConfigured.value) {
      await connect()
    }
  }

  return {
    config,
    connected,
    connecting,
    connectionError,
    isConfigured,
    updateConfig,
    connect,
    tryAutoConnect,
  }
})
