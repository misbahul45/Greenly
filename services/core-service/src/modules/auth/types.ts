export interface RegisterResponse {
  id:string
  email: string
  name: string
}

export interface LoginResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: {
    id:string;
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
  id:string;
  email: string;
}

export interface VerifyEmailResponse {
  user: {
    id:string;
    email: string ;
    name: string | null;
    roles: string[] | any;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface ChangePasswordResponse{
  id:string;
  email:string;
}