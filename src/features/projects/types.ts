export interface Project {
  id: number
  name: string
  owner: string
  status: 'Planning' | 'Active' | 'Blocked' | 'Completed'
  budget: string
}
