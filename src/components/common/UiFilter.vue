<template>
  <Sheet v-model:open="localOpen">
    <SheetContent
      side="right"
      class="w-[440px] p-0 flex flex-col overflow-hidden border-l border-border bg-card"
      @escape-key-down="localOpen = false"
    >

      <!-- ─── HEADER ────────────────────────────────────────────────────── -->
      <SheetHeader class="relative px-6 py-5 border-b border-border shrink-0 space-y-0">
        <div
          class="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-r-full"
          style="box-shadow: 0 0 16px rgb(var(--color-primary) / 0.5)"
        />
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <SlidersHorizontal class="h-4 w-4 text-primary" />
          </div>
          <div class="flex-1 min-w-0">
            <SheetTitle class="text-sm font-bold text-foreground font-mono tracking-tight leading-none">
              Advanced Filters
            </SheetTitle>
            <p class="text-[11px] text-muted-foreground mt-1 leading-none">
              <template v-if="appliedCount > 0">
                <span class="text-primary font-bold">{{ appliedCount }}</span>
                {{ appliedCount === 1 ? 'filter' : 'filters' }} applied
              </template>
              <template v-else>Narrow down your results</template>
            </p>
          </div>
          <button
            v-if="appliedCount > 0"
            type="button"
            class="shrink-0 text-[10px] font-bold uppercase tracking-wider text-destructive/70 hover:text-destructive px-2 py-1 rounded-md border border-destructive/20 hover:border-destructive/40 transition-all duration-150"
            @click="handleReset"
          >
            Clear all
          </button>
        </div>
      </SheetHeader>

      <!-- ─── APPLIED CHIPS ─────────────────────────────────────────────── -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-40"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 max-h-40"
        leave-to-class="opacity-0 max-h-0"
      >
        <div
          v-if="activeEntries.length > 0"
          class="flex flex-wrap gap-1.5 px-6 py-3 border-b border-border/50 bg-primary/[0.03] shrink-0"
        >
          <span
            v-for="[key, val] in activeEntries"
            :key="key"
            class="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/8 px-2.5 py-1 text-xs"
          >
            <span class="text-[9px] font-bold uppercase tracking-widest text-primary/50 shrink-0">
              {{ CHIP_LABELS[key] ?? key }}
            </span>
            <span class="text-foreground font-semibold truncate max-w-[110px]">
              {{ formatChipValue(key, val) }}
            </span>
            <button
              type="button"
              class="rounded-full p-0.5 text-primary/40 hover:text-destructive hover:bg-destructive/10 transition-all duration-100 shrink-0"
              @click="removeChip(key)"
            >
              <X class="h-2.5 w-2.5" />
            </button>
          </span>
        </div>
      </Transition>

      <!-- ─── SCROLLABLE FIELDS ─────────────────────────────────────────── -->
      <div class="flex-1 min-h-0 overflow-y-auto">
        <div class="px-6 py-5 space-y-0 divide-y divide-border/40">

          <!-- ── CREATOR ─────────────────────────────────────────────────
               Combobox-style: Popover + searchable button list.
               Avoids shadcn Select portal/Sheet stacking issues.
          ──────────────────────────────────────────────────────────────── -->
          <div v-if="creatorOptions.length > 0" class="py-5 space-y-2.5 first:pt-0">
            <FilterLabel label="Creator" :active="draft.creator != null" @clear="draft.creator = null" />
            <Popover v-model:open="creatorOpen">
              <PopoverTrigger as-child>
                <button
                  type="button"
                  class="w-full flex items-center gap-2.5 h-9 rounded-lg border bg-background px-3 text-sm transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-primary/40"
                  :class="draft.creator != null ? 'border-primary/40 text-foreground' : 'border-input text-muted-foreground hover:border-primary/30'"
                >
                  <UserIcon class="h-3.5 w-3.5 shrink-0" :class="draft.creator != null ? 'text-primary' : 'text-muted-foreground'" />
                  <span class="flex-1 text-left text-sm">
                    {{ draft.creator != null
                      ? (creatorOptions.find(o => String(o.value) === String(draft.creator))?.label ?? 'Selected')
                      : 'Any creator…' }}
                  </span>
                  <ChevronDown class="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200" :class="creatorOpen ? 'rotate-180' : ''" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                class="w-[360px] p-0 rounded-xl border border-border shadow-2xl bg-card overflow-hidden"
                align="start"
                :side-offset="4"
              >
                <div class="px-3 py-2 border-b border-border bg-muted/20 flex items-center gap-2">
                  <Search class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <input
                    v-model="creatorSearch"
                    type="text"
                    placeholder="Search creators…"
                    class="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
                <div class="max-h-52 overflow-y-auto divide-y divide-border/30">
                  <button
                    type="button"
                    class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors duration-100 hover:bg-muted/50"
                    :class="draft.creator === null ? 'bg-muted/30 text-foreground font-medium' : 'text-muted-foreground'"
                    @click="() => { draft.creator = null; creatorOpen = false }"
                  >
                    <span class="h-4 w-4 shrink-0 flex items-center justify-center rounded-md border border-input bg-background">
                      <Check v-if="draft.creator === null" class="h-2.5 w-2.5 text-primary" />
                    </span>
                    <span class="italic">Any creator</span>
                  </button>
                  <button
                    v-for="opt in filteredCreatorOptions"
                    :key="opt.value"
                    type="button"
                    class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors duration-100 hover:bg-muted/50"
                    :class="String(draft.creator) === String(opt.value) ? 'bg-primary/[0.05] text-foreground font-medium' : 'text-muted-foreground'"
                    @click="() => { draft.creator = opt.value; creatorOpen = false }"
                  >
                    <span
                      class="h-4 w-4 shrink-0 flex items-center justify-center rounded-md border transition-all duration-150"
                      :class="String(draft.creator) === String(opt.value) ? 'border-primary bg-primary' : 'border-input bg-background'"
                    >
                      <Check v-if="String(draft.creator) === String(opt.value)" class="h-2.5 w-2.5 text-primary-foreground" />
                    </span>
                    {{ opt.label }}
                  </button>
                  <div v-if="filteredCreatorOptions.length === 0" class="px-3 py-4 text-xs text-center text-muted-foreground">
                    No creators match
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <!-- ── CREATED AT — single date ────────────────────────────── -->
          <div class="py-5 space-y-2.5">
            <FilterLabel label="Created At" :active="!!draft.created_at" @clear="draft.created_at = null" />
            <Popover v-model:open="createdAtOpen">
              <PopoverTrigger as-child>
                <button
                  type="button"
                  class="w-full flex items-center gap-2.5 h-9 rounded-lg border bg-background px-3 text-sm transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-primary/40"
                  :class="draft.created_at ? 'border-primary/40 text-foreground' : 'border-input text-muted-foreground hover:border-primary/30'"
                >
                  <CalendarIcon
                    class="h-3.5 w-3.5 shrink-0 transition-colors"
                    :class="draft.created_at ? 'text-primary' : 'text-muted-foreground'"
                  />
                  <span class="flex-1 text-left">
                    {{ draft.created_at ? fmtDate(draft.created_at) : 'Pick exact date…' }}
                  </span>
                  <ChevronDown class="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200" :class="createdAtOpen ? 'rotate-180' : ''" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                class="w-auto p-0 rounded-xl border border-border shadow-2xl bg-card overflow-hidden"
                align="start"
                :side-offset="4"
              >
                <Calendar
                  :model-value="toCalDate(draft.created_at)"
                  @update:model-value="(d) => { draft.created_at = fromCalDate(d); createdAtOpen = false }"
                />
                <div class="border-t border-border px-4 py-2.5 flex items-center justify-between bg-muted/30">
                  <span class="text-xs text-muted-foreground">
                    {{ draft.created_at ? fmtDate(draft.created_at) : 'No date selected' }}
                  </span>
                  <button
                    v-if="draft.created_at"
                    type="button"
                    class="text-xs text-destructive/70 hover:text-destructive underline underline-offset-2 transition-colors"
                    @click="draft.created_at = null"
                  >
                    Clear
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <!-- ── DATE RANGE — RangeCalendar ────────────────────────────── -->
          <div class="py-5 space-y-2.5">
            <FilterLabel
              label="Date Range"
              :active="!!(draft.created_from || draft.created_to)"
              @clear="() => { draft.created_from = null; draft.created_to = null }"
            />
            <Popover v-model:open="rangeOpen">
              <PopoverTrigger as-child>
                <button
                  type="button"
                  class="w-full flex items-center gap-2.5 h-9 rounded-lg border bg-background px-3 text-sm transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-primary/40"
                  :class="(draft.created_from || draft.created_to) ? 'border-primary/40 text-foreground' : 'border-input text-muted-foreground hover:border-primary/30'"
                >
                  <CalendarRange
                    class="h-3.5 w-3.5 shrink-0 transition-colors"
                    :class="(draft.created_from || draft.created_to) ? 'text-primary' : 'text-muted-foreground'"
                  />
                  <span class="flex-1 text-left text-xs">
                    <template v-if="draft.created_from || draft.created_to">
                      {{ draft.created_from ? fmtDate(draft.created_from) : '∞' }}
                      <span class="mx-1.5 opacity-40">→</span>
                      {{ draft.created_to ? fmtDate(draft.created_to) : '∞' }}
                    </template>
                    <template v-else>Pick date range…</template>
                  </span>
                  <ChevronDown class="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200" :class="rangeOpen ? 'rotate-180' : ''" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                class="w-auto p-0 rounded-xl border border-border shadow-2xl bg-card overflow-hidden"
                align="start"
                :side-offset="4"
              >
                <RangeCalendar
                  :model-value="rangeValue"
                  @update:model-value="onRangeChange"
                />
                <div class="border-t border-border px-4 py-2.5 flex items-center justify-between bg-muted/30 gap-4">
                  <span class="text-xs text-muted-foreground truncate">
                    <template v-if="draft.created_from || draft.created_to">
                      {{ draft.created_from ? fmtDate(draft.created_from) : '∞' }} → {{ draft.created_to ? fmtDate(draft.created_to) : '∞' }}
                    </template>
                    <template v-else>No range selected</template>
                  </span>
                  <button
                    v-if="draft.created_from || draft.created_to"
                    type="button"
                    class="text-xs text-destructive/70 hover:text-destructive underline underline-offset-2 transition-colors shrink-0"
                    @click="() => { draft.created_from = null; draft.created_to = null }"
                  >
                    Clear
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <!-- ── SORT ─────────────────────────────────────────────────── -->
          <div class="py-5 space-y-2.5">
            <FilterLabel label="Sort Order" :active="!!draft.sort" @clear="draft.sort = null" />
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="opt in SORT_OPTIONS"
                :key="opt.value"
                type="button"
                class="relative flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 overflow-hidden text-left group"
                :class="draft.sort === opt.value
                  ? 'border-primary/50 bg-primary/8 text-foreground shadow-sm'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-muted/30'"
                @click="draft.sort = draft.sort === opt.value ? null : opt.value as any"
              >
                <span v-if="draft.sort === opt.value" class="absolute inset-0 bg-primary/5 pointer-events-none rounded-xl" />
                <component
                  :is="opt.icon"
                  class="h-3.5 w-3.5 shrink-0 relative z-10 transition-colors"
                  :class="draft.sort === opt.value ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'"
                />
                <span class="relative z-10 text-xs">{{ opt.label }}</span>
                <span
                  v-if="draft.sort === opt.value"
                  class="ml-auto relative z-10 h-4 w-4 flex items-center justify-center rounded-full bg-primary shrink-0"
                >
                  <Check class="h-2.5 w-2.5 text-primary-foreground" />
                </span>
              </button>
            </div>
            <p class="text-[10px] text-muted-foreground px-0.5">
              Overrides column sort. Applied after all other filters.
            </p>
          </div>

          <!-- ── TAGS ─────────────────────────────────────────────────── -->
          <div v-if="tagOptions.length > 0" class="py-5 space-y-2.5">
            <FilterLabel
              label="Tags"
              :active="getArr('tags').length > 0"
              @clear="draft.tags = null"
            />

            <!-- Selected chips -->
            <div
              v-if="getArr('tags').length > 0"
              class="flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-primary/20 bg-primary/[0.04]"
            >
              <span
                v-for="val in getArr('tags')"
                :key="val"
                class="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
              >
                <Hash class="h-2.5 w-2.5 shrink-0" />
                <span class="max-w-[80px] truncate">{{ tagLabel(val) }}</span>
                <button
                  type="button"
                  class="ml-0.5 rounded-full p-0.5 text-primary/50 hover:text-destructive hover:bg-destructive/10 transition-all duration-100"
                  @click="toggleArr('tags', val, false)"
                >
                  <X class="h-2.5 w-2.5" />
                </button>
              </span>
            </div>

            <!-- Option list -->
            <div class="rounded-xl border border-border overflow-hidden bg-background">
              <div v-if="tagOptions.length > 5" class="px-3 py-2 border-b border-border bg-muted/20 flex items-center gap-2">
                <Search class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <input
                  v-model="tagSearch"
                  type="text"
                  placeholder="Search tags…"
                  class="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button v-if="tagSearch" type="button" class="text-muted-foreground hover:text-foreground transition-colors" @click="tagSearch = ''">
                  <X class="h-3 w-3" />
                </button>
              </div>
              <div class="max-h-48 overflow-y-auto divide-y divide-border/40">
                <label
                  v-for="opt in filteredTagOptions"
                  :key="opt.value"
                  class="flex items-center gap-3 px-3 py-2.5 cursor-pointer select-none group transition-colors duration-100"
                  :class="isChecked('tags', opt.value) ? 'bg-primary/[0.05]' : 'hover:bg-muted/50'"
                >
                  <span
                    class="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all duration-150"
                    :class="isChecked('tags', opt.value) ? 'border-primary bg-primary shadow-sm' : 'border-input bg-background group-hover:border-primary/50'"
                  >
                    <Check v-if="isChecked('tags', opt.value)" class="h-2.5 w-2.5 text-primary-foreground" />
                  </span>
                  <span
                    class="text-sm transition-colors flex-1"
                    :class="isChecked('tags', opt.value) ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground'"
                  >
                    {{ opt.label }}
                  </span>
                  <span v-if="opt.dot" class="h-2 w-2 rounded-full shrink-0 ml-auto" :class="opt.dot" />
                </label>
                <div v-if="filteredTagOptions.length === 0" class="px-3 py-5 text-xs text-center text-muted-foreground">
                  No tags match "{{ tagSearch }}"
                </div>
              </div>
              <div class="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/20">
                <span class="text-[10px] font-semibold text-muted-foreground">
                  {{ getArr('tags').length }} / {{ tagOptions.length }} selected
                </span>
                <div class="flex gap-3">
                  <button type="button" class="text-[10px] font-bold text-primary/70 hover:text-primary underline underline-offset-2 transition-colors" @click="draft.tags = tagOptions.map(o => o.value)">All</button>
                  <button v-if="getArr('tags').length > 0" type="button" class="text-[10px] font-bold text-muted-foreground hover:text-destructive underline underline-offset-2 transition-colors" @click="draft.tags = null">None</button>
                </div>
              </div>
            </div>
          </div>

          <!-- ── ENTITY-SPECIFIC SLOT ──────────────────────────────────────
               The parent (WorkspaceIndex via UiHeader) injects additional
               entity-specific filter sections here.

               Usage in WorkspaceIndex:
                 <UiHeader>
                   <template #filter-extra="{ draft, on }">
                     <WorkspaceStatusFilter :draft="draft" @update="on" />
                   </template>
                 </UiHeader>

               The slot exposes:
                 draft  — the reactive draft object (add new keys freely)
                 on     — function(key, value) to update draft
          ──────────────────────────────────────────────────────────────── -->
          <div v-if="$slots.extra" class="py-5">
            <slot name="extra" :draft="draft" :on="slotUpdate" />
          </div>

        </div>
      </div>

      <!-- ─── FOOTER ────────────────────────────────────────────────────── -->
      <div class="px-6 pt-4 pb-5 border-t border-border bg-muted/10 shrink-0">
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1 max-h-0"
          enter-to-class="opacity-100 translate-y-0 max-h-14"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0 max-h-14"
          leave-to-class="opacity-0 -translate-y-1 max-h-0"
        >
          <div
            v-if="hasPendingChanges"
            class="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg border border-amber-500/25 bg-amber-500/[0.06] overflow-hidden"
          >
            <span class="relative flex h-1.5 w-1.5 shrink-0">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
            </span>
            <p class="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              Unsaved changes — click Apply to update results
            </p>
          </div>
        </Transition>

        <div class="flex items-center gap-2.5">
          <Button
            variant="outline"
            class="flex-1 h-9 gap-2 rounded-lg text-xs font-semibold border-border hover:border-destructive/40 hover:text-destructive hover:bg-destructive/5 transition-all duration-200"
            @click="handleReset"
          >
            <RotateCcw class="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button
            class="flex-[2] h-9 gap-2 rounded-lg text-sm font-semibold relative overflow-hidden group"
            :class="hasPendingChanges ? 'ring-2 ring-primary/40 ring-offset-1 ring-offset-background' : ''"
            @click="handleApply"
          >
            <span
              v-if="hasPendingChanges"
              class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-700 pointer-events-none"
            />
            <CheckCheck class="h-3.5 w-3.5 shrink-0 relative z-10" />
            <span class="relative z-10">Apply Filters</span>
            <span
              v-if="draftCount > 0"
              class="relative z-10 inline-flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[9px] font-bold bg-primary-foreground/20 border border-primary-foreground/30"
            >{{ draftCount }}</span>
          </Button>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { CalendarDate, parseDate } from '@internationalized/date'
import type { DateRange } from 'reka-ui'
import {
  ArrowDown,
  ArrowUp,
  CalendarIcon,
  CalendarRange,
  Check,
  CheckCheck,
  ChevronDown,
  Hash,
  RotateCcw,
  Search,
  SlidersHorizontal,
  User as UserIcon,
  X,
} from 'lucide-vue-next'
import { computed, defineComponent, h, reactive, ref, watch } from 'vue'
import type { ActiveFilters } from '../../types/filter.types'

// ─── Exported option type (used by UiHeader props) ────────────────────────────
export interface FilterOption {
  label: string
  value: string | number
  dot?: string
}

// ─── Inline FilterLabel sub-component ────────────────────────────────────────
const FilterLabel = defineComponent({
  props: {
    label: { type: String, required: true },
    active: { type: Boolean, default: false },
  },
  emits: ['clear'],
  setup(props, { emit }) {
    return () =>
      h('div', { class: 'flex items-center justify-between min-h-5' }, [
        h('div', { class: 'flex items-center gap-2' }, [
          h('span', { class: 'text-[10px] font-bold uppercase tracking-widest text-muted-foreground' }, props.label),
          props.active
            ? h('span', {
                class: 'inline-block h-1.5 w-1.5 rounded-full bg-primary',
                style: 'box-shadow: 0 0 6px rgb(var(--color-primary) / 0.6)',
              })
            : null,
        ]),
        props.active
          ? h('button', {
              type: 'button',
              class: 'text-[10px] font-semibold text-muted-foreground hover:text-destructive underline underline-offset-2 transition-colors duration-150',
              onClick: () => emit('clear'),
            }, 'Clear')
          : null,
      ])
  },
})

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  creatorOptions?: FilterOption[]
  tagOptions?: FilterOption[]
  /** Currently applied filters — synced into draft on panel open */
  values?: ActiveFilters
}

const props = withDefaults(defineProps<Props>(), {
  creatorOptions: () => [],
  tagOptions: () => [],
  values: () => ({}),
})

const emit = defineEmits<{
  apply: [filters: ActiveFilters]
}>()

const localOpen = defineModel<boolean>('open', { default: false })

// ─── Constants ────────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'desc', label: 'Newest first', icon: ArrowDown },
  { value: 'asc',  label: 'Oldest first', icon: ArrowUp },
] as const

const CHIP_LABELS: Record<string, string> = {
  creator:      'Creator',
  created_at:   'Date',
  created_from: 'From',
  created_to:   'To',
  sort:         'Sort',
  tags:         'Tags',
}

// ─── Draft state ──────────────────────────────────────────────────────────────
// Keys map 1-to-1 to backend BaseFilter method names.
// Extra keys added via the `extra` slot are also reactive via draft[key].
const draft = reactive<ActiveFilters & {
  creator:      string | number | null
  created_at:   string | null
  created_from: string | null
  created_to:   string | null
  sort:         'asc' | 'desc' | null
  tags:         Array<string | number> | null
}>({
  creator:      null,
  created_at:   null,
  created_from: null,
  created_to:   null,
  sort:         null,
  tags:         null,
})

watch(localOpen, (open) => {
  if (!open) return
  const v = props.values ?? {}
  // Reset to applied values
  draft.creator      = v.creator      ?? null
  draft.created_at   = v.created_at   ?? null
  draft.created_from = v.created_from ?? null
  draft.created_to   = v.created_to   ?? null
  draft.sort         = v.sort         ?? null
  draft.tags         = Array.isArray(v.tags) ? [...v.tags] : null
  // Reset any extra slot keys too
  Object.keys(v).forEach((k) => {
    if (!(k in draft)) draft[k] = v[k]
  })
})

// ─── Slot helper — for entity-specific slot sections ─────────────────────────
function slotUpdate(key: string, value: unknown) {
  draft[key] = value
}

// ─── Popover open states (each section has its own so they don't interfere) ──
const creatorOpen   = ref(false)
const createdAtOpen = ref(false)
const rangeOpen     = ref(false)

// ─── Searches ─────────────────────────────────────────────────────────────────
const creatorSearch = ref('')
const tagSearch     = ref('')

const filteredCreatorOptions = computed(() => {
  const q = creatorSearch.value.trim().toLowerCase()
  if (!q) return props.creatorOptions
  return props.creatorOptions.filter((o) => o.label.toLowerCase().includes(q))
})

const filteredTagOptions = computed(() => {
  const q = tagSearch.value.trim().toLowerCase()
  if (!q) return props.tagOptions
  return props.tagOptions.filter((o) => o.label.toLowerCase().includes(q))
})

// ─── Empty check ──────────────────────────────────────────────────────────────
function isEmpty(v: unknown): boolean {
  if (v == null || v === '') return true
  if (Array.isArray(v)) return v.length === 0
  return false
}

// ─── Computed ─────────────────────────────────────────────────────────────────
const draftCount = computed(() =>
  Object.values(draft).filter((v) => !isEmpty(v)).length,
)

const appliedCount = computed(() =>
  Object.values(props.values ?? {}).filter((v) => !isEmpty(v)).length,
)

const activeEntries = computed(() =>
  Object.entries(props.values ?? {}).filter(([, v]) => !isEmpty(v)),
)

const hasPendingChanges = computed(() => {
  const a = props.values ?? {}
  const allKeys = new Set([...Object.keys(a), ...Object.keys(draft)])
  for (const k of allKeys) {
    const av = a[k]
    const dv = draft[k]
    if (Array.isArray(av) && Array.isArray(dv)) {
      if (av.length !== dv.length || av.some((v, i) => String(v) !== String(dv[i]))) return true
    } else if (String(av ?? '') !== String(dv ?? '')) {
      return true
    }
  }
  return false
})

// ─── Date helpers ─────────────────────────────────────────────────────────────
function toCalDate(raw: string | null | undefined): CalendarDate | undefined {
  if (!raw) return undefined
  try { return parseDate(raw) } catch { return undefined }
}

function fromCalDate(d: CalendarDate | undefined | null): string | null {
  if (!d) return null
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
}

const rangeValue = computed<DateRange>(() => ({
  start: toCalDate(draft.created_from),
  end:   toCalDate(draft.created_to),
}))

function onRangeChange(range: DateRange | undefined) {
  draft.created_from = range?.start ? fromCalDate(range.start as CalendarDate) : null
  draft.created_to   = range?.end   ? fromCalDate(range.end   as CalendarDate) : null
}

function fmtDate(val: string | null | undefined): string {
  if (!val) return ''
  try {
    return new Date(val + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  } catch { return val ?? '' }
}

// ─── Array helpers (tags) ─────────────────────────────────────────────────────
function getArr(key: 'tags'): Array<string | number> {
  const v = draft[key]
  return Array.isArray(v) ? v : []
}

function isChecked(key: 'tags', val: string | number): boolean {
  return getArr(key).some((v) => String(v) === String(val))
}

function toggleArr(key: 'tags', val: string | number, checked: boolean) {
  const current = [...getArr(key)]
  if (checked) {
    if (!current.some((v) => String(v) === String(val))) current.push(val)
  } else {
    const idx = current.findIndex((v) => String(v) === String(val))
    if (idx !== -1) current.splice(idx, 1)
  }
  draft[key] = current.length ? current : null
}

function tagLabel(val: string | number): string {
  return props.tagOptions.find((o) => String(o.value) === String(val))?.label ?? String(val)
}

// ─── Chip display ──────────────────────────────────────────────────────────
function formatChipValue(key: string, val: unknown): string {
  if (key === 'sort') return val === 'asc' ? 'Oldest first' : 'Newest first'
  if (key === 'creator') {
    return props.creatorOptions.find((o) => String(o.value) === String(val))?.label ?? String(val)
  }
  if (key === 'tags' && Array.isArray(val)) {
    const labels = (val as Array<string | number>).map((v) => tagLabel(v))
    return labels.length > 2 ? `${labels.slice(0, 2).join(', ')} +${labels.length - 2}` : labels.join(', ')
  }
  if (['created_at', 'created_from', 'created_to'].includes(key)) {
    return fmtDate(String(val))
  }
  return String(val)
}

function removeChip(key: string) {
  if (key === 'created_from' || key === 'created_to') {
    draft.created_from = null
    draft.created_to   = null
  } else {
    draft[key] = null
  }
  emit('apply', buildClean())
}

// ─── Build clean payload ──────────────────────────────────────────────────────
function buildClean(): ActiveFilters {
  const out: ActiveFilters = {}
  for (const [k, v] of Object.entries(draft)) {
    if (!isEmpty(v)) out[k] = v
  }
  return out
}

function handleApply() {
  emit('apply', buildClean())
  localOpen.value = false
}

function handleReset() {
  Object.keys(draft).forEach((k) => { draft[k] = null })
  emit('apply', {})
  localOpen.value = false
}
</script>