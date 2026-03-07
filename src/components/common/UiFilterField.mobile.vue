<template>
  <!-- Accordion-style mobile filter row -->
  <div class="overflow-hidden">
    <!-- Trigger row -->
    <button
      type="button"
      class="w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors duration-150 hover:bg-muted/40"
      :class="open ? 'bg-primary/[0.03]' : ''"
      @click="open = !open"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <!-- Set indicator -->
        <span
          class="flex h-5 w-5 items-center justify-center rounded-lg shrink-0 transition-all duration-200"
          :class="isSet ? 'bg-primary/15 border border-primary/25' : 'bg-muted border border-border'"
        >
          <component
            :is="fieldIcon"
            class="h-2.5 w-2.5 transition-colors"
            :class="isSet ? 'text-primary' : 'text-muted-foreground'"
          />
        </span>
        <div class="min-w-0">
          <p
            class="text-sm font-semibold leading-none transition-colors"
            :class="isSet ? 'text-foreground' : 'text-muted-foreground'"
          >
            {{ field.label }}
          </p>
          <!-- Show active value summary when collapsed -->
          <p
            v-if="isSet && !open"
            class="text-xs text-primary font-medium mt-0.5 truncate"
          >
            {{ valueSummary }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <span
          v-if="isSet"
          class="inline-flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground"
        >
          {{ valueCount }}
        </span>
        <ChevronDown
          class="h-4 w-4 text-muted-foreground transition-transform duration-200"
          :class="open ? 'rotate-180' : ''"
        />
      </div>
    </button>

    <!-- Expandable content -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-[600px]"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 max-h-[600px]"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="open" class="border-t border-border/50 bg-muted/20">
        <div class="px-5 py-4 space-y-3">

          <!-- Clear row -->
          <div class="flex items-center justify-between">
            <p v-if="field.description" class="text-xs text-muted-foreground flex-1 pr-4">
              {{ field.description }}
            </p>
            <button
              v-if="isSet"
              type="button"
              class="ml-auto text-xs text-destructive/70 hover:text-destructive underline underline-offset-2 transition-colors shrink-0"
              @click="emit('clear', field.key)"
            >
              Clear
            </button>
          </div>

          <!-- ── TEXT ────────────────────────────────────────────────── -->
          <Input
            v-if="field.type === 'text'"
            :model-value="draft[field.key] ?? ''"
            :placeholder="field.placeholder ?? `Filter by ${field.label.toLowerCase()}…`"
            class="h-10 rounded-xl bg-background border-input text-sm"
            @update:model-value="(v) => emit('update', field.key, v || null)"
          />

          <!-- ── NUMBER ──────────────────────────────────────────────── -->
          <Input
            v-else-if="field.type === 'number'"
            type="number"
            :model-value="draft[field.key] ?? ''"
            :placeholder="field.placeholder"
            class="h-10 rounded-xl bg-background border-input text-sm"
            @update:model-value="(v) => emit('update', field.key, v ? Number(v) : null)"
          />

          <!-- ── DATE — inline Calendar (better mobile UX) ───────────── -->
          <div v-else-if="field.type === 'date'" class="space-y-2">
            <div
              class="rounded-xl border border-border overflow-hidden bg-background"
            >
              <Calendar
                :model-value="dateValue(field.key)"
                class="w-full"
                @update:model-value="(d) => onDateChange(field.key, d)"
              />
            </div>
            <div
              v-if="draft[field.key]"
              class="flex items-center justify-between px-1"
            >
              <span class="text-xs text-primary font-semibold">
                ✓ {{ formatDate(draft[field.key]) }}
              </span>
              <button
                type="button"
                class="text-xs text-destructive/70 hover:text-destructive underline underline-offset-2 transition-colors"
                @click="emit('update', field.key, null)"
              >
                Clear date
              </button>
            </div>
          </div>

          <!-- ── SELECT ──────────────────────────────────────────────── -->
          <div v-else-if="field.type === 'select'" class="space-y-1.5">
            <button
              v-for="opt in field.options"
              :key="opt.value"
              type="button"
              class="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border text-sm font-medium transition-all duration-150 text-left"
              :class="
                String(draft[field.key]) === String(opt.value)
                  ? 'border-primary/40 bg-primary/8 text-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-muted/40'
              "
              @click="
                emit(
                  'update',
                  field.key,
                  String(draft[field.key]) === String(opt.value) ? null : opt.value,
                )
              "
            >
              <span
                class="flex h-4 w-4 items-center justify-center rounded-full border shrink-0 transition-all duration-150"
                :class="
                  String(draft[field.key]) === String(opt.value)
                    ? 'border-primary bg-primary'
                    : 'border-input'
                "
              >
                <Check
                  v-if="String(draft[field.key]) === String(opt.value)"
                  class="h-2.5 w-2.5 text-primary-foreground"
                />
              </span>
              {{ opt.label }}
              <span v-if="opt.dot" class="ml-auto h-2 w-2 rounded-full" :class="opt.dot" />
            </button>
          </div>

          <!-- ── MULTI-SELECT / TAGS ─────────────────────────────────── -->
          <div v-else-if="field.type === 'multi-select'" class="space-y-2">
            <!-- selected chips -->
            <div
              v-if="getMultiValues(field.key).length > 0"
              class="flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-primary/20 bg-primary/[0.04]"
            >
              <span
                v-for="val in getMultiValues(field.key)"
                :key="val"
                class="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
              >
                <span class="max-w-[120px] truncate">{{ optionLabel(field, val) }}</span>
                <button
                  type="button"
                  class="rounded-full p-0.5 hover:bg-destructive/15 hover:text-destructive text-primary/60 transition-colors"
                  @click="toggleMulti(field.key, val, false)"
                >
                  <X class="h-2.5 w-2.5" />
                </button>
              </span>
            </div>

            <!-- option buttons — pill style -->
            <div class="flex flex-wrap gap-2">
              <button
                v-for="opt in field.options"
                :key="opt.value"
                type="button"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-150"
                :class="
                  isMultiChecked(field.key, opt.value)
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'
                "
                @click="toggleMulti(field.key, opt.value, !isMultiChecked(field.key, opt.value))"
              >
                <Check
                  v-if="isMultiChecked(field.key, opt.value)"
                  class="h-2.5 w-2.5 shrink-0"
                />
                <span v-if="opt.dot" class="h-1.5 w-1.5 rounded-full shrink-0" :class="opt.dot" />
                {{ opt.label }}
              </button>
            </div>

            <!-- count summary -->
            <div
              v-if="getMultiValues(field.key).length > 0"
              class="flex items-center justify-between px-0.5"
            >
              <span class="text-xs text-primary font-medium">
                {{ getMultiValues(field.key).length }} selected
              </span>
              <button
                type="button"
                class="text-xs text-muted-foreground hover:text-destructive underline underline-offset-2 transition-colors"
                @click="emit('update', field.key, null)"
              >
                Deselect all
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { CalendarDate, parseDate } from '@internationalized/date'
import { CalendarIcon, Check, ChevronDown, Hash, SlidersHorizontal, Text, ToggleLeft, X } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import type { ActiveFilters, FilterField } from './types/filter.types'

const props = defineProps<{
  field: FilterField
  draft: ActiveFilters
}>()

const emit = defineEmits<{
  update: [key: string, value: any]
  clear: [key: string]
}>()

const open = ref(false)

// ─── Field icon by type ───────────────────────────────────────────────────────
const fieldIcon = computed(() => {
  const map: Record<string, any> = {
    text: Text,
    number: Hash,
    date: CalendarIcon,
    select: ToggleLeft,
    'multi-select': SlidersHorizontal,
  }
  return map[props.field.type] ?? SlidersHorizontal
})

// ─── isSet / summary ──────────────────────────────────────────────────────────
const isSet = computed(() => {
  const v = props.draft[props.field.key]
  if (v == null || v === '') return false
  if (Array.isArray(v)) return v.length > 0
  return true
})

const valueCount = computed(() => {
  const v = props.draft[props.field.key]
  if (Array.isArray(v)) return v.length
  return isSet.value ? 1 : 0
})

const valueSummary = computed(() => {
  const v = props.draft[props.field.key]
  if (!v) return ''
  if (Array.isArray(v)) {
    const labels = v.map(
      (x) => props.field.options?.find((o) => String(o.value) === String(x))?.label ?? String(x),
    )
    return labels.length > 2 ? `${labels.slice(0, 2).join(', ')} +${labels.length - 2}` : labels.join(', ')
  }
  if (props.field.type === 'date') return formatDate(v)
  return props.field.options?.find((o) => String(o.value) === String(v))?.label ?? String(v)
})

// ─── Date ─────────────────────────────────────────────────────────────────────
function dateValue(key: string): CalendarDate | undefined {
  const raw = props.draft[key]
  if (!raw) return undefined
  try { return parseDate(String(raw)) } catch { return undefined }
}

function onDateChange(key: string, d: CalendarDate | undefined) {
  if (!d) { emit('update', key, null); return }
  const m = String(d.month).padStart(2, '0')
  const dy = String(d.day).padStart(2, '0')
  emit('update', key, `${d.year}-${m}-${dy}`)
}

function formatDate(val: unknown): string {
  if (!val) return ''
  try {
    return new Date(String(val)).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  } catch { return String(val) }
}

// ─── Multi-select ─────────────────────────────────────────────────────────────
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
</script>