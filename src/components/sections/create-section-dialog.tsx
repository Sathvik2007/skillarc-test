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
import type { Section, CreateSectionInput } from "@/modules/sections"

interface CreateSectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateSectionInput) => Promise<void>
  section?: Section | null
  programs: Array<{ id: string; name: string }>
  facultyAdvisors: Array<{ id: string; name: string; email: string }>
  isLoading?: boolean
}

export function CreateSectionDialog({
  open,
  onOpenChange,
  onSubmit,
  section,
  programs,
  facultyAdvisors,
  isLoading = false,
}: CreateSectionDialogProps) {
  const [formData, setFormData] = useState<CreateSectionInput>({
    name: section?.name || "",
    semester: section?.semester || 1,
    program_id: section?.program_id || "",
    institution_id: section?.institution_id || "",
    faculty_advisor_id: section?.faculty_advisor_id || "",
  })
  const { toast } = useToast()

  useEffect(() => {
    setFormData({
      name: section?.name || "",
      semester: section?.semester || 1,
      program_id: section?.program_id || "",
      institution_id: section?.institution_id || "",
      faculty_advisor_id: section?.faculty_advisor_id || "",
    })
  }, [section])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.program_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }
    try {
      await onSubmit(formData)
      onOpenChange(false)
      setFormData({
        name: "",
        semester: 1,
        program_id: "",
        institution_id: "",
        faculty_advisor_id: "",
      })
      toast({
        title: "Success",
        description: `Section ${section ? "updated" : "created"} successfully`,
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
          <DialogTitle>{section ? "Edit Section" : "Create Section"}</DialogTitle>
          <DialogDescription>
            {section
              ? "Update section details and faculty advisor assignment"
              : "Create a new section for your program"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Section Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Section A, Section 1"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="semester">Semester *</Label>
              <Input
                id="semester"
                type="number"
                min="1"
                max="8"
                value={formData.semester}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    semester: parseInt(e.target.value) || 1,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="program">Program *</Label>
              <select
                id="program"
                value={formData.program_id ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, program_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select program</option>
                {programs.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="advisor">Faculty Advisor</Label>
            <select
              id="advisor"
              value={formData.faculty_advisor_id ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  faculty_advisor_id: e.target.value || null,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No advisor</option>
              {facultyAdvisors.map((advisor) => (
                <option key={advisor.id} value={advisor.id}>
                  {advisor.name} ({advisor.email})
                </option>
              ))}
            </select>
          </div>

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
              {isLoading ? "Saving..." : section ? "Update Section" : "Create Section"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}