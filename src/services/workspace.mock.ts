import type { Workspace, WorkspaceFormData } from '@/types/workspace'

const seed: Workspace[] = [
  { id: 1, name: 'Platform Reliability', description: 'Incident and uptime workflows', owner: 'Ari Chen', status: 'Active', createdAt: '2025-09-10', updatedAt: '2026-01-09', members: 12 },
  { id: 2, name: 'Growth Ops', description: 'Experimentation and campaigns', owner: 'Maya Holt', status: 'Paused', createdAt: '2025-11-03', updatedAt: '2026-01-02', members: 8 },
  { id: 3, name: 'Finance Automation', description: 'Billing and reconciliation', owner: 'Kian Wu', status: 'Archived', createdAt: '2025-06-21', updatedAt: '2025-12-18', members: 5 },
]

let db = [...seed]

const wait = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms))

export async function listWorkspaces() {
  await wait()
  return [...db]
}

export async function getWorkspace(id: number) {
  await wait()
  return db.find((row) => row.id === id)
}

export async function createWorkspace(payload: WorkspaceFormData) {
  await wait()
  const row: Workspace = {
    id: Date.now(),
    ...payload,
    createdAt: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10),
    members: 1,
  }
  db = [row, ...db]
  return row
}

export async function updateWorkspace(id: number, payload: WorkspaceFormData) {
  await wait()
  const index = db.findIndex((row) => row.id === id)
  if (index === -1) return undefined
  db[index] = { ...db[index], ...payload, updatedAt: new Date().toISOString().slice(0, 10) }
  return db[index]
}

export async function deleteWorkspace(id: number) {
  await wait()
  db = db.filter((row) => row.id !== id)
  return true
}
