<template>
  <div class="search-bar" ref="rootRef">
    <div class="search-input-wrap">
      <Search class="search-icon" :size="14" />
      <input
        ref="inputRef"
        v-model="query"
        class="input search-input"
        placeholder="ค้นหายาด้วยรหัสหรือชื่อ…"
        autocomplete="off"
        @focus="showDropdown = true"
        @keydown.escape="close"
        @keydown.down.prevent="moveCursor(1)"
        @keydown.up.prevent="moveCursor(-1)"
        @keydown.enter.prevent="selectCurrent"
      />
      <button v-if="query" class="btn-clear" @click="clear"><X :size="12" /></button>
    </div>

    <Transition name="dropdown">
      <div v-if="showDropdown && (results.length > 0 || loading)" class="dropdown">
        <div v-if="loading" class="dropdown-loading">
          <span class="animate-pulse">กำลังค้นหา…</span>
        </div>
        <template v-else>
          <button
            v-for="(drug, i) in results"
            :key="drug.working_code"
            :class="['dropdown-item', { active: cursor === i }]"
            @mouseenter="cursor = i"
            @click="select(drug)"
          >
            <span class="drug-code font-mono">{{ drug.working_code }}</span>
            <span class="drug-name">{{ drug.drug_name || '—' }}</span>
          </button>
        </template>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, X } from 'lucide-vue-next'
import { onClickOutside } from '../composables/onClickOutside'
import { useDrugData, type DrugItem } from '../composables/useDrugData'

const emit = defineEmits<{ (e: 'select', drug: DrugItem): void }>()

const { searchDrugs } = useDrugData()

const query = ref('')
const results = ref<DrugItem[]>([])
const loading = ref(false)
const showDropdown = ref(false)
const cursor = ref(0)
const rootRef = ref<HTMLElement | null>(null)

onClickOutside(rootRef, () => close())

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(query, (val) => {
  cursor.value = 0
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!val.trim()) {
    results.value = []
    showDropdown.value = false
    return
  }
  debounceTimer = setTimeout(async () => {
    loading.value = true
    results.value = await searchDrugs(val.trim())
    showDropdown.value = true
    loading.value = false
  }, 300)
})

function select(drug: DrugItem) {
  query.value = drug.working_code
  emit('select', drug)
  close()
}

function selectCurrent() {
  if (results.value[cursor.value]) select(results.value[cursor.value])
}

function moveCursor(dir: number) {
  cursor.value = Math.max(0, Math.min(results.value.length - 1, cursor.value + dir))
}

function close() {
  showDropdown.value = false
}

function clear() {
  query.value = ''
  results.value = []
  showDropdown.value = false
}
</script>

<style scoped>
.search-bar {
  position: relative;
  width: 280px;
}

.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  padding-left: 32px;
  padding-right: 30px;
}

.btn-clear {
  position: absolute;
  right: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  padding: 2px 4px;
  border-radius: 3px;
  transition: color var(--transition-fast);
}

.btn-clear:hover {
  color: var(--text-primary);
}

.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--bg-base);
  border: 1px solid var(--border-active);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-hover);
  max-height: 280px;
  overflow-y: auto;
  z-index: 200;
}

.dropdown-loading {
  padding: 12px 16px;
  color: var(--text-muted);
  font-size: 13px;
}

.dropdown-item {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px 14px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  border-bottom: 1px solid var(--border-subtle);
  transition: background var(--transition-fast);
}

.dropdown-item:last-child { border-bottom: none; }

.dropdown-item:hover,
.dropdown-item.active {
  background: var(--bg-elevated);
}

.drug-code {
  font-size: 13px;
  font-weight: 600;
  color: var(--banana-dark);
}

.drug-name {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
