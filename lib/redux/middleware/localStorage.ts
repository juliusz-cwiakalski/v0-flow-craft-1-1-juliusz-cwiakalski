import { Middleware } from "@reduxjs/toolkit"
import { RootState } from "../store"

const isDate = (value: unknown): value is string => {
  // ISO 8601 with optional milliseconds, ending with Z (UTC)
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
}

const dateReviver = (key: string, value: any) => {
  if (isDate(value)) {
    return new Date(value)
  }
  return value
}

export const loadState = (): RootState | undefined => {
  if (typeof window === "undefined") return undefined
  try {
    const serializedState = localStorage.getItem("flowcraftState")
    if (serializedState === null) {
      return undefined
    }
    return JSON.parse(serializedState, dateReviver)
  } catch (err) {
    console.error("Could not load state from localStorage", err)
    return undefined
  }
}

export const saveState = (state: RootState) => {
  if (typeof window === "undefined") return
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem("flowcraftState", serializedState)
  } catch (err) {
    console.error("Could not save state to localStorage", err)
  }
}

export const localStorageMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  const result = next(action)
  saveState(store.getState())
  return result
}
