export type UserResponse = {
  id: string
  email: string
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING_VERIFICATION'
  emailVerified?: boolean

  profile: {
    fullName: string | null
    phone: string | null
    avatarUrl: string | null
    photoUrl?: string | null
    address: string | null
  }

  roles: string[]

  shop?: {
    id: string
    name: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  }[]

  createdAt?: string
}
