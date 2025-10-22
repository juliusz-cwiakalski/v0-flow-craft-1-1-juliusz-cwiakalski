"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { User } from "@/types"
import type { RootState, AppDispatch } from "@/lib/redux/store"
import { addUser, updateUser, deleteUser } from "@/lib/redux/slices/usersSlice"

export function UsersPanel() {
  const dispatch = useDispatch<AppDispatch>()
  const users = useSelector((state: RootState) => state.users.users)
  const projects = useSelector((state: RootState) => state.projects.projects)
  const teams = useSelector((state: RootState) => state.teams.teams)

  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const filteredUsers = searchQuery
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : users

  const handleAddUser = () => {
    if (!userName.trim()) return
    dispatch(
      addUser({
        name: userName.trim(),
        email: userEmail.trim() || undefined,
      }),
    )
    setUserName("")
    setUserEmail("")
  }

  const handleUpdateUser = () => {
    if (!editingUser || !userName.trim()) return
    dispatch(
      updateUser({
        ...editingUser,
        name: userName.trim(),
        email: userEmail.trim() || undefined,
      }),
    )
    setEditingUser(null)
    setUserName("")
    setUserEmail("")
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return

    const isReferencedInProjects = projects.some((p) => p.members?.includes(deleteTarget.id))
    const isReferencedInTeams = teams.some((t) => t.members?.includes(deleteTarget.id))

    if (isReferencedInProjects || isReferencedInTeams) {
      alert(`Cannot delete user "${deleteTarget.name}" because they are assigned to one or more projects or teams.`)
      setDeleteTarget(null)
      return
    }

    dispatch(deleteUser(deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users Directory</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search-users">Search Users</Label>
          <Input
            id="search-users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
          />
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-2 border rounded">
              <div>
                <p className="font-medium">{user.name}</p>
                {user.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Dialog
                  open={editingUser?.id === user.id}
                  onOpenChange={(open) => {
                    if (open) {
                      setEditingUser(user)
                      setUserName(user.name)
                      setUserEmail(user.email || "")
                    } else {
                      setEditingUser(null)
                      setUserName("")
                      setUserEmail("")
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      ✏️
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-user-name">Name</Label>
                        <Input
                          id="edit-user-name"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="Enter user name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-user-email">Email (optional)</Label>
                        <Input
                          id="edit-user-email"
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          placeholder="Enter email"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEditingUser(null)}>
                          Cancel
                        </Button>
                        <Button onClick={handleUpdateUser} disabled={!userName.trim()}>
                          Update
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ id: user.id, name: user.name })}>
                  🗑️
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-4 border-t">
          <Label htmlFor="new-user-name">Add New User</Label>
          <div className="space-y-2">
            <Input
              id="new-user-name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="User name"
            />
            <Input
              id="new-user-email"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Email (optional)"
            />
            <Button onClick={handleAddUser} disabled={!userName.trim()} className="w-full">
              Add User
            </Button>
          </div>
        </div>
      </CardContent>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
              <span className="block mt-2 text-sm">
                Note: You cannot delete a user that is assigned to any projects or teams.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
