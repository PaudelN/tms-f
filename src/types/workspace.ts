export interface Workspace {
  id: number
  name: string
  description: string
  owner: string
  status: 'Active' | 'Paused' | 'Archived'
  createdAt: string
  updatedAt: string
  members: number
}

export interface WorkspaceFormData {
  name: string
  description: string
  owner: string
  status: Workspace['status']
}
