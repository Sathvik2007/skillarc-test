"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { SubjectsList } from "@/components/subjects/subjects-list"
import { CreateSubjectDialog } from "@/components/subjects/create-subject-dialog"
import { useToast } from "@/components/ui/use-toast"

export function SubjectsClientPage({
  initialSubjects,
  departments,
  programs,
  institutionId,
}: any) {
  const [subjects, setSubjects] = useState(initialSubjects)
  const [open, setOpen] = useState(false)

  const { toast } = useToast()

  async function handleCreate(data: any) {
    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        institution_id: institutionId,
      }),
    })

    if (!res.ok) {
      toast({
        title: "Error",
        description: "Failed to create subject",
        variant: "destructive",
      })
      return
    }

    const subject = await res.json()
    setSubjects((prev: any) => [...prev, subject])
    setOpen(false)

    toast({
      title: "Success",
      description: "Subject created successfully",
    })
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/subjects/${id}`, {
      method: "DELETE",
    })

    if (!res.ok) return

    setSubjects((prev: any) =>
      prev.filter((s: any) => s.id !== id)
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subjects</h1>
          <p className="text-gray-500">Manage academic subjects</p>
        </div>

        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Subject
        </Button>
      </div>

      <Card className="p-6">
        <SubjectsList
          subjects={subjects}
          onDelete={handleDelete}
        />
      </Card>

      <CreateSubjectDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleCreate}
        departments={departments}
        programs={programs}
      />
    </div>
  )
}