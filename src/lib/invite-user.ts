import { headers } from "next/headers"

export function resolveAppOrigin(headersValue?: Headers | { get(name: string): string | null } | null): string {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (configuredOrigin) {
    return configuredOrigin.replace(/\/+$/, "")
  }

  if (headersValue) {
    const forwardedProto = headersValue.get("x-forwarded-proto")
    const forwardedHost = headersValue.get("x-forwarded-host")
    const host = forwardedHost?.split(",")[0]?.trim() || headersValue.get("host")
    const proto = forwardedProto?.split(",")[0]?.trim() || "https"

    if (host) {
      return `${proto}://${host}`.replace(/\/+$/, "")
    }
  }

  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, "")}`
  }

  if (process.env.NEXTAUTH_URL?.trim()) {
    return process.env.NEXTAUTH_URL.replace(/\/+$/, "")
  }

  return "http://localhost:3000"
}

export async function getRequestAppOrigin() {
  const headerStore = await headers()
  return resolveAppOrigin(headerStore)
}

export async function readResponseError(response: Response, fallback = "Request failed") {
  try {
    const contentType = response.headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
      const data = await response.json()

      if (typeof data === "string") return data
      if (data && typeof data === "object" && "error" in data) {
        const errorValue = (data as { error?: unknown }).error
        if (typeof errorValue === "string") return errorValue
      }
    }

    const text = await response.text()
    if (text?.trim()) return text
  } catch (error) {
    console.warn("[invite-user] failed to parse error response", error)
  }

  return fallback
}
