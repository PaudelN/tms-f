<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { EyeIcon, PencilIcon, Trash2Icon, LayoutPanelLeftIcon } from "lucide-vue-next";
import { useWorkspaceStore, type Workspace } from "@/stores/workspace";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import UiPageHeader from "@/components/shared/UiPageHeader.vue";
import UiTable, { type UiTableColumn } from "@/components/shared/UiTable.vue";
import UiStatCard from "@/components/shared/UiStatCard.vue";
import UiStatusBadge from "@/components/shared/UiStatusBadge.vue";
import UiActionIconButton from "@/components/shared/UiActionIconButton.vue";
import UiErrorBoundary from "@/components/shared/UiErrorBoundary.vue";
import AddWorkspace from "@/views/workspace/add.vue";
import EditWorkspace from "@/views/workspace/edit.vue";
import DetailWorkspace from "@/views/workspace/detail.vue";
import { toast } from "@/utils/toast";

const store = useWorkspaceStore();
const detailOpen = ref(false);
const formOpen = ref(false);
const deleteOpen = ref(false);
const formMode = ref<"add" | "edit">("add");
const selected = ref<Workspace | null>(null);

const columns: UiTableColumn<Workspace>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "user", label: "Owner" },
  { key: "created_at", label: "Created", sortable: true },
  { key: "actions", label: "", type: "actions" },
];

const metrics = computed(() => ({
  total: store.workspaceList.length,
  archived: store.workspaceList.filter((w) => w.isArchived).length,
  active: store.workspaceList.filter((w) => !w.isArchived).length,
}));

onMounted(async () => {
  try {
    await store.fetchWorkspaces();
  } catch {
    toast.error("Unable to load workspaces");
  }
});

function openAdd() {
  formMode.value = "add";
  selected.value = null;
  formOpen.value = true;
}
function openDetail(row: Workspace) {
  selected.value = row;
  detailOpen.value = true;
}
function openEdit() {
  if (!selected.value) return;
  detailOpen.value = false;
  formMode.value = "edit";
  formOpen.value = true;
}
async function createWorkspace(payload: { name: string; description: string }) {
  await toast.promise(store.createWorkspace(payload), { loading: "Creating workspace...", success: "Workspace created", error: "Failed to create workspace" });
  formOpen.value = false;
}
async function updateWorkspace(payload: { name: string; description: string }) {
  if (!selected.value) return;
  await toast.promise(store.updateWorkspace(selected.value.id, payload), { loading: "Saving changes...", success: "Workspace updated", error: "Failed to update workspace" });
  formOpen.value = false;
}
function askDelete() { deleteOpen.value = true; }
async function confirmDelete() {
  if (!selected.value) return;
  await toast.promise(store.deleteWorkspace(selected.value.id), { loading: "Deleting workspace...", success: "Workspace deleted", error: "Failed to delete workspace" });
  deleteOpen.value = false;
  detailOpen.value = false;
}
</script>

<template>
  <div class="space-y-4">
    <UiPageHeader title="Workspaces" description="Manage collaboration spaces with calm, contextual workflows." action-label="New workspace" @action="openAdd" />

    <div class="grid gap-3 md:grid-cols-3">
      <UiStatCard label="Total" :value="metrics.total" />
      <UiStatCard label="Active" :value="metrics.active" hint="Operational spaces" />
      <UiStatCard label="Archived" :value="metrics.archived" hint="Read-only spaces" />
    </div>

    <UiErrorBoundary v-if="store.hasError" :message="store.errorMessage ?? 'Unknown workspace error'" />

    <UiTable :data="store.workspaceList" :columns="columns" :loading="store.isLoading" @row-click="openDetail">
      <template #cell-name="{ row }">
        <div class="flex items-center gap-2">
          <LayoutPanelLeftIcon class="h-4 w-4 text-primary" />
          <span class="font-medium">{{ row.name }}</span>
          <UiStatusBadge v-if="row.isArchived" label="Archived" tone="outline" />
        </div>
      </template>
      <template #cell-user="{ row }">{{ row.user?.name ?? 'Unassigned' }}</template>
      <template #cell-created_at="{ row }"><span class="tabular-nums">{{ new Date(row.created_at).toLocaleDateString() }}</span></template>
      <template #cell-actions="{ row }">
        <div class="flex justify-end gap-1">
          <UiActionIconButton title="View" @click.stop="openDetail(row)"><EyeIcon class="h-4 w-4" /></UiActionIconButton>
          <UiActionIconButton title="Edit" @click.stop="selected = row; openEdit()"><PencilIcon class="h-4 w-4" /></UiActionIconButton>
          <UiActionIconButton title="Delete" variant="destructive" @click.stop="selected = row; askDelete()"><Trash2Icon class="h-4 w-4" /></UiActionIconButton>
        </div>
      </template>
    </UiTable>

    <Dialog v-model:open="formOpen">
      <DialogContent>
        <AddWorkspace v-if="formMode === 'add'" @submit="createWorkspace" @cancel="formOpen = false" />
        <EditWorkspace v-else :workspace="selected" :loading="store.isLoading" @submit="updateWorkspace" @cancel="formOpen = false" />
      </DialogContent>
    </Dialog>

    <Sheet v-model:open="detailOpen">
      <SheetContent class="w-full sm:max-w-xl">
        <SheetHeader><SheetTitle>Workspace details</SheetTitle></SheetHeader>
        <DetailWorkspace :workspace="selected" @edit="openEdit" @delete="askDelete" />
      </SheetContent>
    </Sheet>

    <AlertDialog v-model:open="deleteOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete workspace</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone and will remove all linked references.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction @click="confirmDelete">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
