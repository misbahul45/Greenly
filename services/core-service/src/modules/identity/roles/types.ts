export interface RolePermissionResponse {
  id: string
  name: string
}

export interface RolesResponse {
  id: string
  name: string
  permissions?: RolePermissionResponse[]
}