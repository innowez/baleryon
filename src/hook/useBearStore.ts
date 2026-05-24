import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BearStore {
  bears: number
  addABear: () => void
}

export const useBearStore = create<BearStore>()(
  persist(
    (set, get) => ({
      bears: 0,
      addABear: () => set({ bears: get().bears + 1 }),
    }),
    {
      name: 'food-storage',
    },
  ),
)