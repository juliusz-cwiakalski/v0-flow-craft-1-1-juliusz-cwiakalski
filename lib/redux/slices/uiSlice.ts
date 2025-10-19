import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { ViewType } from "@/types"

interface UIState {
  currentView: ViewType
  showWhatsNew: boolean
  showQuickCapture: boolean
  hasUnseenUpdates: boolean
}

const initialState: UIState = {
  currentView: "issues",
  showWhatsNew: false,
  showQuickCapture: false,
  hasUnseenUpdates: false,
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setCurrentView(state, action: PayloadAction<ViewType>) {
      state.currentView = action.payload
    },
    setShowWhatsNew(state, action: PayloadAction<boolean>) {
      state.showWhatsNew = action.payload
    },
    setShowQuickCapture(state, action: PayloadAction<boolean>) {
      state.showQuickCapture = action.payload
    },
    setHasUnseenUpdates(state, action: PayloadAction<boolean>) {
      state.hasUnseenUpdates = action.payload
    },
  },
})

export const { setCurrentView, setShowWhatsNew, setShowQuickCapture, setHasUnseenUpdates } = uiSlice.actions
export default uiSlice.reducer
