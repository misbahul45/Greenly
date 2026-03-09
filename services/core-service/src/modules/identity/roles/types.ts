export interface RolePermissionResponse {
  id: number
  name: string
}

export interface RolesResponse {
  id: number
  name: string
  permissions?: RolePermissionResponse[]
}