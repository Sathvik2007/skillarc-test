"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import type { Parent, CreateParentInput, UpdateParentInput } from "@/modules/parents"

interface CreateParentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateParentInput | UpdateParentInput, isEdit: boolean) => Promise<void>
  parent?: Parent | null
  isLoading?: boolean
}

export function CreateParentDialog({
  open,
  onOpenChange,
  onSubmit,
  parent,
  isLoading = false,
}: CreateParentDialogProps) {
  const [formData, setFormData] = useState<CreateParentInput | UpdateParentInput>({
    name: parent?.name || "",
    email: parent?.email || "",
    password: "",
    institution_id: parent?.institution_id || "",
    organization_id: parent?.organization_id || null,
  })
  const { toast } = useToast()

  useEffect(() => {
    setFormData({
      name: parent?.name || "",
      email: parent?.email || "",
      password: "",
      institution_id: parent?.institution_id || "",
      organization_id: parent?.organization_id || null,
    })
  }, [parent])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || (!parent && !(formData as CreateParentInput).email)) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      })
      return
    }

    try {
      await onSubmit(formData, !!parent)
      onOpenChange(false)
      setFormData({
        name: "",
        email: "",
        password: "",
        institution_id: "",
        organization_id: null,
      })
      toast({
        title: "Success",
        description: parent ? "Parent updated successfully" : "Parent created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{parent ? "Edit Parent" : "Create Parent"}</DialogTitle>
          <DialogDescription>
            {parent ? "Update parent details" : "Create a new parent account"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Parent name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {!parent && (
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="parent@example.com"
                value={(formData as CreateParentInput).email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          )}

          {!parent && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Optional temporary password"
                value={"password" in formData ? formData.password || "" : ""}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Saving..." : parent ? "Update Parent" : "Create Parent"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}