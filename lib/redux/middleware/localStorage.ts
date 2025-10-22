import { Middleware } from "@reduxjs/toolkit"

const isDate = (value: unknown): value is string => {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
}

const dateReviver = (key: string, value: unknown) => {
  if (isDate(value)) {
    return new Date(value)
  }
  return value as unknown
}

export const loadState = (): unknown => {
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

export const saveState = (state: unknown) => {
  if (typeof window === "undefined") return
  try {
    const serializedState = JSON.stringify(state as object)
    localStorage.setItem("flowcraftState", serializedState)
  } catch (err) {
    console.error("Could not save state to localStorage", err)
  }
}

export const localStorageMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action)
  saveState(store.getState())
  return result
}
