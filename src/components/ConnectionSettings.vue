<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="visible" class="drawer-overlay" @click.self="close">
        <div class="drawer-panel">
          <!-- Header -->
          <div class="drawer-header">
            <span class="drawer-title">
              <Settings2 :size="16" />
              ตั้งค่าการเชื่อมต่อฐานข้อมูล
            </span>
            <button class="btn-icon" @click="close"><X :size="16" /></button>
          </div>

          <!-- Status badge -->
          <div class="status-row">
            <span :class="['badge', dbStore.connected ? 'badge-connected' : 'badge-disconnected']">
              <span :class="['status-dot', dbStore.connected ? 'dot-green' : 'dot-red']" />
              {{ dbStore.connected ? 'เชื่อมต่อแล้ว' : 'ยังไม่ได้เชื่อมต่อ' }}
            </span>
          </div>

          <!-- Form -->
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Server / Host IP</label>
              <input
                v-model="localCfg.host"
                class="input"
                placeholder="192.168.1.10"
                autocomplete="off"
              />
            </div>

            <div class="form-group form-group--half">
              <label class="form-label">Port</label>
              <input
                v-model.number="localCfg.port"
                class="input"
                type="number"
                min="1"
                max="65535"
                placeholder="1433"
              />
            </div>

            <div class="form-group form-group--half">
              <label class="form-label">Named Instance</label>
              <input
                v-model="localCfg.instance"
                class="input"
                placeholder="(เว้นว่างถ้าไม่มี)"
                autocomplete="off"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Database</label>
              <input v-model="localCfg.database" class="input" placeholder="INVS" />
            </div>

            <div class="form-group">
              <label class="form-label">Username</label>
              <input
                v-model="localCfg.user"
                class="input"
                placeholder="sa"
                autocomplete="username"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="password-wrap">
                <input
                  v-model="localCfg.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="input"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
                <button class="btn-icon small" @click="showPassword = !showPassword">
                  <EyeOff v-if="showPassword" :size="14" />
                  <Eye v-else :size="14" />
                </button>
              </div>
            </div>
          </div>

          <!-- Error message -->
          <div v-if="dbStore.connectionError" class="error-box">
            <AlertTriangle :size="14" />
            {{ dbStore.connectionError }}
          </div>

          <!-- Actions -->
          <div class="drawer-actions">
            <button class="btn btn-ghost" @click="close">ยกเลิก</button>
            <button
              class="btn btn-accent"
              :disabled="dbStore.connecting"
              @click="testAndSave"
            >
              <span v-if="dbStore.connecting" class="animate-pulse">กำลังเชื่อมต่อ…</span>
              <template v-else>
                <PlugZap :size="14" />
                ทดสอบ & บันทึก
              </template>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Settings2, X, Eye, EyeOff, AlertTriangle, PlugZap } from 'lucide-vue-next'
import { useDbConfigStore } from '../stores/dbConfig'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'connected'): void
}>()

const dbStore = useDbConfigStore()
const showPassword = ref(false)

const localCfg = ref({ ...dbStore.config })

watch(
  () => props.visible,
  (v) => {
    if (v) localCfg.value = { ...dbStore.config }
  }
)

function close() {
  emit('close')
}

async function testAndSave() {
  dbStore.updateConfig({ ...localCfg.value })
  const ok = await dbStore.connect()
  if (ok) {
    emit('connected')
    close()
  }
}
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(45, 30, 15, 0.4);
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
  z-index: 1000;
}

.drawer-panel {
  width: 380px;
  background: var(--bg-base);
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -6px 0 32px rgba(74, 40, 0, 0.18);
  padding: 24px;
  gap: 16px;
  overflow-y: auto;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.drawer-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  color: var(--banana-dark);
}

.btn-icon {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 6px;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast), color var(--transition-fast);
}

.btn-icon:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
}

.btn-icon.small {
  position: absolute;
  right: 6px;
  padding: 0 6px;
}

.status-row {
  display: flex;
  align-items: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.dot-green { background: var(--status-normal); }
.dot-red   { background: var(--status-high); }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group {
  grid-column: span 2;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group--half {
  grid-column: span 1;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.password-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrap .input {
  padding-right: 36px;
}

.error-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: rgba(193, 18, 31, 0.07);
  border: 1px solid rgba(193, 18, 31, 0.25);
  border-radius: var(--radius-sm);
  color: var(--status-high);
  font-size: 13px;
  padding: 10px 14px;
  line-height: 1.5;
}

.drawer-actions {
  margin-top: auto;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* Transitions */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity var(--transition-med);
}

.drawer-enter-active .drawer-panel,
.drawer-leave-active .drawer-panel {
  transition: transform var(--transition-med);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer-panel,
.drawer-leave-to .drawer-panel {
  transform: translateX(100%);
}
</style>
