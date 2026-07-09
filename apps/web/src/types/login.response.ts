export interface LoginResponse {
  tokens: {
    accessToken: string
    refreshToken: string
  }
  user: {
    id: string
    email: string
    name: string
    roles: string[]
  }
}
