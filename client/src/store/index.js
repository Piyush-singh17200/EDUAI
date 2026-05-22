import { create } from 'zustand';

export const useStore = create((set) => ({
  // User state
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  // Set user
  setUser: (user) => set({ user }),

  // Set token
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },

  // Clear token
  clearToken: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },

  // Set loading state
  setLoading: (isLoading) => set({ isLoading }),

  // Set error
  setError: (error) => set({ error }),

  // Clear error
  clearError: () => set({ error: null }),

  // Study data
  timeTable: null,
  optimizedSchedule: null,
  setTimeTable: (timeTable) => set({ timeTable }),
  setOptimizedSchedule: (schedule) => set({ optimizedSchedule: schedule }),

  // Career roadmap
  careerRoadmap: null,
  setCareerRoadmap: (roadmap) => set({ careerRoadmap: roadmap }),

  // Resume analysis
  resumeAnalysis: null,
  setResumeAnalysis: (analysis) => set({ resumeAnalysis: analysis }),

  // Todos
  todos: [],
  addTodo: (todo) => set((state) => ({ todos: [...state.todos, todo] })),
  updateTodo: (id, updates) => set((state) => ({
    todos: state.todos.map((t) => t.id === id ? { ...t, ...updates } : t)
  })),
  removeTodo: (id) => set((state) => ({ todos: state.todos.filter((t) => t.id !== id) })),
}));
