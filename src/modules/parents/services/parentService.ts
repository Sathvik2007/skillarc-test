import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Parent, CreateParentInput, UpdateParentInput } from "../types/parent.types"
import { ROLES } from "@/constants/roles"

export async function createSupabaseParentClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

export async function getParentsByInstitution(institutionId: string): Promise<Parent[]> {
  const supabase = await createSupabaseParentClient()
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("institution_id", institutionId)
    .eq("role", ROLES.PARENT)
    .order("name")

  if (error) throw new Error(`Failed to fetch parents: ${error.message}`)
  return data || []
}

export async function getParentById(parentId: string): Promise<Parent> {
  const supabase = await createSupabaseParentClient()
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", parentId)
    .eq("role", ROLES.PARENT)
    .single()

  if (error) throw new Error(`Failed to fetch parent: ${error.message}`)
  return data
}

export async function createParent(input: CreateParentInput): Promise<Parent> {
  const supabase = await createSupabaseParentClient()

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password || Math.random().toString(36).slice(-12),
    email_confirm: true,
  })

  if (authError) throw new Error(`Failed to create auth user: ${authError.message}`)

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        id: authData.user.id,
        name: input.name,
        email: input.email,
        role: ROLES.PARENT,
        institution_id: input.institution_id,
        organization_id: input.organization_id || null,
      },
    ])
    .select()
    .single()

  if (error) throw new Error(`Failed to create parent profile: ${error.message}`)
  return data
}

export async function updateParent(parentId: string, input: UpdateParentInput): Promise<Parent> {
  const supabase = await createSupabaseParentClient()
  const { data, error } = await supabase
    .from("users")
    .update(input)
    .eq("id", parentId)
    .eq("role", ROLES.PARENT)
    .select()
    .single()

  if (error) throw new Error(`Failed to update parent: ${error.message}`)
  return data
}

export async function deleteParent(parentId: string): Promise<void> {
  const supabase = await createSupabaseParentClient()
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", parentId)
    .eq("role", ROLES.PARENT)

  if (error) throw new Error(`Failed to delete parent: ${error.message}`)
}

export async function getParentCount(institutionId: string): Promise<number> {
  const supabase = await createSupabaseParentClient()
  const { count, error } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("institution_id", institutionId)
    .eq("role", ROLES.PARENT)

  if (error) throw new Error(`Failed to count parents: ${error.message}`)
  return count || 0
}