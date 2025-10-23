"use client"

import React, { createContext, useContext } from "react"

const defaultLocale = typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US"

const LocaleContext = createContext<string>(defaultLocale)

export const useLocale = () => useContext(LocaleContext)

export const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
  // In future, locale could come from Redux/user settings
  const locale = defaultLocale
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}
