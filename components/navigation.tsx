"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ViewType, Issue, Sprint } from "@/types"

interface NavigationProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
  issues: Issue[]
  sprints: Sprint[]
  hasUnseenUpdates?: boolean
  onWhatsNewClick?: () => void
}

export function Navigation({
  currentView,
  onViewChange,
  issues,
  sprints,
  hasUnseenUpdates = false,
  onWhatsNewClick,
}: NavigationProps) {
  const activeSprint = sprints.find((sprint) => sprint.status === "Active")
  const activeSprintIssues = issues.filter((issue) => issue.sprintId === activeSprint?.id)

  const navItems = [
    {
      id: "issues" as ViewType,
      label: "Issues",
      icon: "📋",
      count: issues.length,
    },
    {
      id: "current-sprint" as ViewType,
      label: "Current Sprint",
      icon: "📊",
      count: activeSprintIssues.length,
      disabled: !activeSprint,
    },
    {
      id: "sprints" as ViewType,
      label: "Sprints",
      icon: "📅",
      count: sprints.length,
    },
  ]

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⚡</span>
              <h1 className="text-xl font-semibold">FlowCraft</h1>
            </div>

            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = currentView === item.id
                const isDisabled = item.disabled

                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => !isDisabled && onViewChange(item.id)}
                    disabled={isDisabled}
                    className={cn(
                      "flex items-center gap-2",
                      isActive && "bg-secondary text-secondary-foreground",
                      isDisabled && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    <Badge variant="outline" className="ml-1 text-xs">
                      {item.count}
                    </Badge>
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!activeSprint && currentView === "current-sprint" && (
              <div className="text-sm text-muted-foreground">No active sprint</div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onWhatsNewClick}
              className="relative flex items-center gap-2"
              title="What's New"
            >
              <span className="text-lg">✨</span>
              <span className="hidden sm:inline">What's New</span>
              {hasUnseenUpdates && <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
