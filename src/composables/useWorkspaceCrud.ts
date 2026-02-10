import { computed, ref } from 'vue'
import * as api from '@/services/workspace.mock'
import type { Workspace, WorkspaceFormData } from '@/types/workspace'
import { toast } from '@/utils/toast'

export function useWorkspaceCrud() {
  const rows = ref<Workspace[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const stats = computed(() => ({
    total: rows.value.length,
    active: rows.value.filter((row) => row.status === 'Active').length,
    paused: rows.value.filter((row) => row.status === 'Paused').length,
    archived: rows.value.filter((row) => row.status === 'Archived').length,
  }))

  async function refresh() {
    loading.value = true
    error.value = null
    try {
      rows.value = await api.listWorkspaces()
    } catch (err) {
      error.value = 'Unable to load workspaces.'
      toast.error('Failed to load workspaces')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function create(payload: WorkspaceFormData) {
    await toast.promise(api.createWorkspace(payload), {
      loading: 'Creating workspace...',
      success: 'Workspace created',
      error: 'Workspace creation failed',
    })
    await refresh()
  }

  async function update(id: number, payload: WorkspaceFormData) {
    await toast.promise(api.updateWorkspace(id, payload), {
      loading: 'Saving changes...',
      success: 'Workspace updated',
      error: 'Workspace update failed',
    })
    await refresh()
  }

  async function remove(id: number) {
    await toast.promise(api.deleteWorkspace(id), {
      loading: 'Deleting workspace...',
      success: 'Workspace removed',
      error: 'Delete failed',
    })
    await refresh()
  }

  return { rows, loading, error, stats, refresh, create, update, remove }
}
