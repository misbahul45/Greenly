interface UserLogin{
    sub:number
    email:string
    roles:string[]
    refreshToken?:string
    accessToken?:string
    status:'ACTIVE' | '  PENDING_VERIFICATION' | 'BANNED' | 'SUSPENDED'
}