// types/user.ts

export type UserResponse = {
  id: number
  email: string
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING_VERIFICATION'
  emailVerified: boolean

  profile: {
    fullName: string | null
    phone: string | null
    avatarUrl: string | null
    address: string | null
  }

  roles: string[]

  shop: {
    id: number
    name: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  }[]

  createdAt: string
}