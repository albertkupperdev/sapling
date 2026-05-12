import { create } from 'zustand'
import type { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task'

type TaskFilter = 'all' | 'today' | 'energy-low' | 'energy-high'

interface TaskStore {
  tasks: Task[]
  activeFilter: TaskFilter
  isLoading: boolean
  selectedTaskId: string | null

  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  reorderTasks: (activeId: string, overId: string) => void
  setFilter: (filter: TaskFilter) => void
  setLoading: (loading: boolean) => void
  selectTask: (id: string | null) => void

  getFilteredTasks: () => Task[]
  getTaskById: (id: string) => Task | undefined
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  activeFilter: 'all',
  isLoading: false,
  selectedTaskId: null,

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) =>
    set((state) => ({ tasks: [task, ...state.tasks] })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  deleteTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

  reorderTasks: (activeId, overId) =>
    set((state) => {
      const tasks = [...state.tasks]
      const activeIndex = tasks.findIndex((t) => t.id === activeId)
      const overIndex = tasks.findIndex((t) => t.id === overId)
      if (activeIndex === -1 || overIndex === -1) return state
      const [moved] = tasks.splice(activeIndex, 1)
      tasks.splice(overIndex, 0, moved)
      return { tasks }
    }),

  setFilter: (activeFilter) => set({ activeFilter }),
  setLoading: (isLoading) => set({ isLoading }),
  selectTask: (selectedTaskId) => set({ selectedTaskId }),

  getFilteredTasks: () => {
    const { tasks, activeFilter } = get()
    const today = new Date().toISOString().split('T')[0]
    switch (activeFilter) {
      case 'today':
        return tasks.filter((t) => t.due_date === today && t.status !== 'done')
      case 'energy-low':
        return tasks.filter((t) => t.energy_level === 1 && t.status !== 'done')
      case 'energy-high':
        return tasks.filter((t) => t.energy_level === 3 && t.status !== 'done')
      default:
        return tasks.filter((t) => t.status !== 'archived')
    }
  },

  getTaskById: (id) => get().tasks.find((t) => t.id === id),
}))
