"use client"

import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { RootState, AppDispatch } from "@/lib/redux/store"
import { addTeam, updateTeam, deleteTeam } from "@/lib/redux/slices/teamsSlice"
import type { Team } from "@/types"

export function TeamsPanel() {
  const dispatch: AppDispatch = useDispatch()
  const { teams } = useSelector((state: RootState) => state.teams)
  const { users } = useSelector((state: RootState) => state.users)
  const { issues } = useSelector((state: RootState) => state.issues)

  const [showDialog, setShowDialog] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [teamName, setTeamName] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [memberSearch, setMemberSearch] = useState("")
  const [error, setError] = useState("")

  const handleCreate = () => {
    setEditingTeam(null)
    setTeamName("")
    setSelectedMembers([])
    setMemberSearch("")
    setError("")
    setShowDialog(true)
  }

  const handleEdit = (team: Team) => {
    setEditingTeam(team)
    setTeamName(team.name)
    setSelectedMembers(team.members || [])
    setMemberSearch("")
    setError("")
    setShowDialog(true)
  }

  const handleSave = () => {
    if (!teamName.trim()) {
      setError("Team name is required")
      return
    }

    const uniqueMembers = Array.from(new Set(selectedMembers))
    if (uniqueMembers.length !== selectedMembers.length) {
      setError("Cannot add the same user twice to a team")
      return
    }

    if (editingTeam) {
      dispatch(
        updateTeam({
          ...editingTeam,
          name: teamName.trim(),
          members: uniqueMembers,
          updatedAt: new Date(),
        }),
      )
    } else {
      dispatch(
        addTeam({
          name: teamName.trim(),
          members: uniqueMembers,
        }),
      )
    }

    setShowDialog(false)
  }

  const handleDelete = (teamId: string) => {
    const referencedIssues = issues.filter((issue) => issue.teamId === teamId)
    if (referencedIssues.length > 0) {
      alert(
        `Cannot delete team: ${referencedIssues.length} issue(s) are assigned to this team. Please reassign them first.`,
      )
      return
    }

    if (confirm("Are you sure you want to delete this team?")) {
      dispatch(deleteTeam(teamId))
    }
  }

  const handleAddMember = (userId: string) => {
    if (!selectedMembers.includes(userId)) {
      setSelectedMembers([...selectedMembers, userId])
      setMemberSearch("")
    }
  }

  const handleRemoveMember = (userId: string) => {
    setSelectedMembers(selectedMembers.filter((id) => id !== userId))
  }

  const availableUsers = users.filter(
    (user) =>
      !selectedMembers.includes(user.id) &&
      (user.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        user.email?.toLowerCase().includes(memberSearch.toLowerCase())),
  )

  const getSelectedUserNames = () => {
    return selectedMembers.map((id) => users.find((u) => u.id === id)?.name || "Unknown").join(", ")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Teams</h2>
          <p className="text-muted-foreground">Manage teams and their members</p>
        </div>
        <Button onClick={handleCreate}>Create Team</Button>
      </div>

      <div className="grid gap-4">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{team.name}</CardTitle>
                  <CardDescription>
                    {team.members && team.members.length > 0 ? `${team.members.length} member(s)` : "No members"}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(team)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(team.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            {team.members && team.members.length > 0 && (
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {team.members.map((userId) => {
                    const user = users.find((u) => u.id === userId)
                    return (
                      <span
                        key={userId}
                        className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm"
                      >
                        {user?.name || "Unknown User"}
                      </span>
                    )
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        {teams.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No teams yet. Create your first team to get started.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTeam ? "Edit Team" : "Create Team"}</DialogTitle>
            <DialogDescription>
              {editingTeam ? "Update team details and members" : "Add a new team with members"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                value={teamName}
                onChange={(e) => {
                  setTeamName(e.target.value)
                  setError("")
                }}
                placeholder="e.g., Engineering Team"
              />
            </div>

            <div className="space-y-2">
              <Label>Members</Label>
              <div className="space-y-2">
                <Input
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search users to add..."
                />

                {memberSearch && availableUsers.length > 0 && (
                  <div className="border rounded-md max-h-40 overflow-y-auto">
                    {availableUsers.slice(0, 5).map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleAddMember(user.id)}
                        className="w-full px-3 py-2 text-left hover:bg-secondary flex flex-col"
                      >
                        <span className="font-medium">{user.name}</span>
                        {user.email && <span className="text-sm text-muted-foreground">{user.email}</span>}
                      </button>
                    ))}
                  </div>
                )}

                {selectedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                    {selectedMembers.map((userId) => {
                      const user = users.find((u) => u.id === userId)
                      return (
                        <span
                          key={userId}
                          className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
                        >
                          {user?.name || "Unknown"}
                          <button
                            onClick={() => handleRemoveMember(userId)}
                            className="hover:text-destructive"
                            aria-label="Remove member"
                          >
                            ×
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editingTeam ? "Save Changes" : "Create Team"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
