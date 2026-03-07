<template>
  <div class="space-y-2.5">
    <!-- Label row -->
    <div class="flex items-center justify-between min-h-[20px]">
      <div class="flex items-center gap-2">
        <span class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {{ field.label }}
        </span>
        <!-- active dot -->
        <span
          v-if="isSet"
          class="inline-block h-1.5 w-1.5 rounded-full bg-primary"
          style="box-shadow: 0 0 6px rgb(var(--color-primary) / 0.6)"
        />
      </div>
      <button
        v-if="isSet"
        type="button"
        class="text-[10px] font-semibold text-muted-foreground hover:text-destructive transition-colors duration-150 underline underline-offset-2"
        @click="emit('clear', field.key)"
      >
        Clear
      </button>
    </div>

    <!-- Description -->
    <p
      v-if="field.description"
      class="text-[11px] text-muted-foreground leading-relaxed -mt-1"
    >
      {{ field.description }}
    </p>

    <!-- ── TEXT ─────────────────────────────────────────────────────────── -->
    <Input
      v-if="field.type === 'text'"
      :model-value="draft[field.key] ?? ''"
      :placeholder="field.placeholder ?? `Filter by ${field.label.toLowerCase()}…`"
      class="h-9 rounded-lg bg-background border-input focus-visible:ring-1 focus-visible:ring-primary/50 text-sm"
      @update:model-value="(v) => emit('update', field.key, v || null)"
    />

    <!-- ── NUMBER ───────────────────────────────────────────────────────── -->
    <Input
      v-else-if="field.type === 'number'"
      type="number"
      :model-value="draft[field.key] ?? ''"
      :placeholder="field.placeholder"
      class="h-9 rounded-lg bg-background border-input focus-visible:ring-1 focus-visible:ring-primary/50 text-sm"
      @update:model-value="(v) => emit('update', field.key, v ? Number(v) : null)"
    />

    <!-- ── DATE (shadcn Calendar in Popover) ──────────────────────────── -->
    <Popover v-else-if="field.type === 'date'">
      <PopoverTrigger as-child>
        <button
          type="button"
          class="w-full flex items-center gap-2.5 h-9 rounded-lg border border-input bg-background px-3 text-sm transition-all duration-150 hover:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
          :class="draft[field.key] ? 'text-foreground' : 'text-muted-foreground'"
        >
          <CalendarIcon class="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span class="flex-1 text-left">
            {{ draft[field.key] ? formatDate(draft[field.key]) : (field.placeholder ?? 'Pick a date…') }}
          </span>
          <ChevronDown class="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        class="w-auto p-0 rounded-xl border border-border shadow-2xl bg-card overflow-hidden"
        align="start"
        :side-offset="6"
      >
        <!-- Month/year header is built into the Calendar component -->
        <Calendar
          :model-value="dateValue(field.key)"
          class="rounded-xl"
          @update:model-value="(d) => onDateChange(field.key, d)"
        />
        <!-- Clear shortcut inside popover -->
        <div class="border-t border-border px-4 py-2.5 flex items-center justify-between bg-muted/30">
          <span class="text-xs text-muted-foreground">
            {{ draft[field.key] ? formatDate(draft[field.key]) : 'No date selected' }}
          </span>
          <button
            v-if="draft[field.key]"
            type="button"
            class="text-xs text-destructive/70 hover:text-destructive underline underline-offset-2 transition-colors"
            @click="emit('update', field.key, null)"
          >
            Clear
          </button>
        </div>
      </PopoverContent>
    </Popover>

    <!-- ── SELECT ───────────────────────────────────────────────────────── -->
    <Select
      v-else-if="field.type === 'select'"
      :model-value="draft[field.key] != null ? String(draft[field.key]) : ''"
      @update:model-value="(v) => emit('update', field.key, v || null)"
    >
      <SelectTrigger
        class="h-9 rounded-lg border-input bg-background text-sm focus:ring-1 focus:ring-primary/50 data-[placeholder]:text-muted-foreground"
      >
        <SelectValue :placeholder="`Select ${field.label.toLowerCase()}…`" />
      </SelectTrigger>
      <SelectContent
        class="rounded-xl border border-border shadow-2xl bg-card p-1 max-h-60 overflow-y-auto"
      >
        <SelectItem
          value=""
          class="rounded-lg text-sm text-muted-foreground italic cursor-pointer"
        >
          Any (no filter)
        </SelectItem>
        <SelectItem
          v-for="opt in field.options"
          :key="opt.value"
          :value="String(opt.value)"
          class="rounded-lg text-sm cursor-pointer"
        >
          {{ opt.label }}
        </SelectItem>
      </SelectContent>
    </Select>

    <!-- ── MULTI-SELECT / TAGS ───────────────────────────────────────────── -->
    <div v-else-if="field.type === 'multi-select'" class="space-y-2">
      <!-- Selected tag chips -->
      <div
        v-if="getMultiValues(field.key).length > 0"
        class="flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-primary/20 bg-primary/[0.04] min-h-[42px]"
      >
        <span
          v-for="val in getMultiValues(field.key)"
          :key="val"
          class="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-all duration-150 hover:bg-primary/15"
        >
          <span class="max-w-[100px] truncate">{{ optionLabel(field, val) }}</span>
          <button
            type="button"
            class="rounded-full p-0.5 hover:bg-destructive/15 hover:text-destructive text-primary/60 transition-colors duration-100"
            @click="toggleMulti(field.key, val, false)"
          >
            <X class="h-2.5 w-2.5" />
          </button>
        </span>
      </div>

      <!-- Option list — searchable if many options -->
      <div class="rounded-xl border border-border overflow-hidden bg-background">
        <!-- Search within options (show if > 6 options) -->
        <div
          v-if="(field.options?.length ?? 0) > 6"
          class="px-3 py-2 border-b border-border bg-muted/20"
        >
          <div class="flex items-center gap-2">
            <Search class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              v-model="optionSearch[field.key]"
              type="text"
              placeholder="Search options…"
              class="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        <div class="max-h-44 overflow-y-auto divide-y divide-border/40">
          <label
            v-for="opt in filteredOptions(field)"
            :key="opt.value"
            class="flex items-center gap-3 px-3 py-2.5 cursor-pointer select-none group transition-colors duration-100"
            :class="
              isMultiChecked(field.key, opt.value)
                ? 'bg-primary/[0.06]'
                : 'hover:bg-muted/60'
            "
          >
            <!-- Custom styled checkbox -->
            <span
              class="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all duration-150"
              :class="
                isMultiChecked(field.key, opt.value)
                  ? 'border-primary bg-primary'
                  : 'border-input bg-background group-hover:border-primary/50'
              "
            >
              <Check
                v-if="isMultiChecked(field.key, opt.value)"
                class="h-2.5 w-2.5 text-primary-foreground"
              />
            </span>
            <span
              class="text-sm transition-colors duration-100"
              :class="
                isMultiChecked(field.key, opt.value)
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground group-hover:text-foreground'
              "
            >
              {{ opt.label }}
            </span>
            <!-- optional color dot for status-type options -->
            <span
              v-if="opt.dot"
              class="ml-auto h-2 w-2 rounded-full shrink-0"
              :class="opt.dot"
            />
          </label>
          <div
            v-if="filteredOptions(field).length === 0"
            class="px-3 py-4 text-xs text-center text-muted-foreground"
          >
            No options match
          </div>
        </div>

        <!-- Select all / Deselect all row -->
        <div
          v-if="(field.options?.length ?? 0) > 1"
          class="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/20"
        >
          <span class="text-[10px] text-muted-foreground">
            {{ getMultiValues(field.key).length }} / {{ field.options?.length ?? 0 }} selected
          </span>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="text-[10px] font-semibold text-primary/70 hover:text-primary underline underline-offset-2 transition-colors"
              @click="selectAll(field)"
            >
              All
            </button>
            <button
              v-if="getMultiValues(field.key).length > 0"
              type="button"
              class="text-[10px] font-semibold text-muted-foreground hover:text-destructive underline underline-offset-2 transition-colors"
              @click="emit('update', field.key, null)"
            >
              None
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarDate, parseDate } from '@internationalized/date'
import { CalendarIcon, Check, ChevronDown, Search, X } from 'lucide-vue-next'
import { computed, reactive } from 'vue'
import type { ActiveFilters, FilterField, FilterFieldOption } from './types/filter.types'

// ─── Props / Emits ────────────────────────────────────────────────────────────
const props = defineProps<{
  field: FilterField
  draft: ActiveFilters
}>()

const emit = defineEmits<{
  update: [key: string, value: any]
  clear: [key: string]
}>()

// ─── State ────────────────────────────────────────────────────────────────────
const optionSearch = reactive<Record<string, string>>({})

// ─── Computed ─────────────────────────────────────────────────────────────────
const isSet = computed(() => {
  const v = props.draft[props.field.key]
  if (v == null || v === '') return false
  if (Array.isArray(v)) return v.length > 0
  return true
})

// ─── Date helpers (shadcn Calendar uses @internationalized/date) ──────────────
function dateValue(key: string): CalendarDate | undefined {
  const raw = props.draft[key]
  if (!raw) return undefined
  try {
    return parseDate(String(raw)) // 'YYYY-MM-DD'
  } catch {
    return undefined
  }
}

function onDateChange(key: string, d: CalendarDate | undefined) {
  if (!d) {
    emit('update', key, null)
    return
  }
  // Store as 'YYYY-MM-DD' — exactly what the backend BaseFilter expects
  const month = String(d.month).padStart(2, '0')
  const day = String(d.day).padStart(2, '0')
  emit('update', key, `${d.year}-${month}-${day}`)
}

function formatDate(val: unknown): string {
  if (!val) return ''
  try {
    return new Date(String(val)).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return String(val)
  }
}

// ─── Multi-select helpers ─────────────────────────────────────────────────────
function getMultiValues(key: string): Array<string | number> {
  const v = props.draft[key]
  return Array.isArray(v) ? v : []
}

function isMultiChecked(key: string, val: string | number): boolean {
  return getMultiValues(key).some((v) => String(v) === String(val))
}

function toggleMulti(key: string, val: string | number, checked: boolean) {
  const current = [...getMultiValues(key)]
  if (checked) {
    if (!current.some((v) => String(v) === String(val))) current.push(val)
  } else {
    const idx = current.findIndex((v) => String(v) === String(val))
    if (idx !== -1) current.splice(idx, 1)
  }
  emit('update', key, current.length ? current : null)
}

function optionLabel(field: FilterField, val: string | number): string {
  return field.options?.find((o) => String(o.value) === String(val))?.label ?? String(val)
}

function filteredOptions(field: FilterField): FilterFieldOption[] {
  const q = (optionSearch[field.key] ?? '').toLowerCase()
  if (!q) return field.options ?? []
  return (field.options ?? []).filter((o) => o.label.toLowerCase().includes(q))
}

function selectAll(field: FilterField) {
  emit('update', field.key, (field.options ?? []).map((o) => o.value))
}
</script>