export interface RegisterResponse {
  id: number
  email: string
  name: string
}

export interface LoginResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: {
    id: number;
    email: string;
    name: string;
    roles: string[]
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ChangePasswordResponse {
  id: number;
  email: string;
}

export interface VerifyEmailResponse {
  user: {
    id: number;
    email: string ;
    name: string | null;
    roles: string[] | any;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface ChnagePasswordResponse{
  id:number;
  email:string;
}