"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectsPanel } from "@/components/settings/projects-panel"
import { TeamsPanel } from "@/components/settings/teams-panel"
import { UsersPanel } from "@/components/settings/users-panel"
import { TemplatesPanel } from "@/components/settings/templates-panel"


interface SettingsViewProps {
  initialTab?: "projects" | "teams" | "users" | "templates"
}

export function SettingsView({ initialTab = "projects" }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState(initialTab)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage projects, teams, users, and templates</p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-6">
          <ProjectsPanel />
        </TabsContent>

        <TabsContent value="teams" className="mt-6">
          <TeamsPanel />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UsersPanel />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <TemplatesPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
