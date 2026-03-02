export type ApiStatus = 'success' | 'error';

export interface ApiResponse<T> {
  status: ApiStatus;
  statusCode: number;
  path: string;
  message: string;
  data?: T;
  errors?:any;
  timestamp: string;
}