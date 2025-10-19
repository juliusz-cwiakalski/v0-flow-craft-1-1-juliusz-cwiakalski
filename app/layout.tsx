import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { ReduxProvider } from "@/lib/redux/provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "TaskFlow - Linear-style Task Management",
  description: "A complete task management app with sprints, kanban boards, and issue tracking",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ReduxProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </ReduxProvider>
      </body>
    </html>
  )
}
