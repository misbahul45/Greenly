interface UserLogin{
    sub:number
    email:string
    roles:string[]
    refreshToken?:string
    accessToken?:string
    status:'ACTIVE' | '  PENDING_VERIFICATION' | 'BANNED' | 'SUSPENDED'
}

interface ApiResponse<T, M = undefined> {
  data: T | null
  message: string
  meta?: M extends undefined
    ? {
        total?: number
        page?: number
        limit?: number
        lastPage?: number
      }
    : M
}