import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type GenerationStatus = 'idle' | 'uploading' | 'generating' | 'completed' | 'failed'

export interface FurniturePlacement {
  id: string
  name: string
  category: string
  price: number
  retailer: string
  productUrl: string
  imageUrl?: string
  position: { x: number; y: number }
}

export interface LayoutResult {
  imageUrl: string
  totalPrice: number
  furniture: FurniturePlacement[]
}

interface RoomfitState {
  imageFile: File | null
  imagePreviewUrl: string | null
  style: string | null
  budget: number
  request: string
  status: GenerationStatus
  error: string | null
  designId: string | null
  setImage: (file: File | null, previewUrl: string | null) => void
  setStyle: (style: string) => void
  setBudget: (budget: number) => void
  setRequest: (request: string) => void
  setStatus: (status: GenerationStatus) => void
  setError: (error: string | null) => void
  setDesignId: (designId: string | null) => void
  reset: () => void
}

const initialState = {
  imageFile: null,
  imagePreviewUrl: null,
  style: null,
  budget: 1_500_000,
  request: '',
  status: 'idle' as GenerationStatus,
  error: null,
  designId: null,
}

export const useRoomfitStore = create<RoomfitState>()(
  persist(
    (set) => ({
      ...initialState,
      setImage: (imageFile, imagePreviewUrl) => set({ imageFile, imagePreviewUrl }),
      setStyle: (style) => set({ style }),
      setBudget: (budget) => set({ budget }),
      setRequest: (request) => set({ request }),
      setStatus: (status) => set({ status }),
      setError: (error) => set({ error }),
      setDesignId: (designId) => set({ designId }),
      reset: () => set(initialState),
    }),
    {
      name: 'roomfit-draft',
      partialize: ({ style, budget, request }) => ({ style, budget, request }),
    },
  ),
)
