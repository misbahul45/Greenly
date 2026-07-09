export type ApiStatus = "success" | "error" | false

export interface ApiMeta {
  total?: number
  page?: number
  limit?: number
  totalPages?: number
  lastPage?: number
  [key: string]: {} | undefined
}

export interface ApiResponse<T> {
  status: ApiStatus
  statusCode?: number
  path?: string
  message: string
  data?: T
  errors?: unknown
  meta?: ApiMeta
  metaData?: ApiMeta
  metadata?: ApiMeta
  timestamp?: string
}
