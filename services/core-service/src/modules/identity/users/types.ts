export interface FindUsersResponse {
  
}

export interface UserResponse {
  id: number
  email: string
  name: string | null
  status: string
  isActive: boolean
  createdAt: Date
  profile: {
    fullName: string | null
    phoneNumber: string | null
    address: string | null
    avatarUrl: string | null
  } | null
}