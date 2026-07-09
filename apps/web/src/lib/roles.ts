export function normalizeRoles(roles: unknown[]): string[] {
  return roles.map((r) => {
    if (typeof r === "string") return r.trim().toUpperCase()
    if (typeof r === "object" && r !== null) {
      const obj = r as Record<string, any>
      const name = obj.name ?? obj.role?.name ?? ""
      return String(name).trim().toUpperCase()
    }
    return ""
  }).filter(Boolean)
}

export function hasRole(roles: unknown[], ...targetRoles: string[]): boolean {
  const normalized = normalizeRoles(roles)
  const targets = targetRoles.map((r) => r.trim().toUpperCase())
  return normalized.some((r) => targets.includes(r))
}
