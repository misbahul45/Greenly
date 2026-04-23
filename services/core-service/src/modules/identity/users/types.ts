export interface UserResponse {
  id: string
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