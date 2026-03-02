export interface LoginResponse{
    tokens:{
        accessToken: string;
        refreshToken: string;
    },
    user:{
        id:number,
        email:string,
        name:string
    }
}