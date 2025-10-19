import { configureStore } from "@reduxjs/toolkit"
import issuesReducer from "./slices/issuesSlice"
import sprintsReducer from "./slices/sprintsSlice"
import uiReducer from "./slices/uiSlice"
import { localStorageMiddleware, loadState } from "./middleware/localStorage"

const preloadedState = loadState()

export const store = configureStore({
  reducer: {
    issues: issuesReducer,
    sprints: sprintsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(localStorageMiddleware),
  preloadedState,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
