import axios from "axios"

const CORE_API_URL = "https://greenly-api.duckdns.org/api/core"
const CATALOG_API_URL = "https://greenly-api.duckdns.org/api/catalog"

export const createApi = (accessToken?: string) => {
  return axios.create({
    baseURL: process.env.API_URL ?? CORE_API_URL,
    headers: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : undefined,
  })
}

export const createCatalogApi = (accessToken?: string) => {
  return axios.create({
    baseURL: process.env.CATALOG_API_URL ?? CATALOG_API_URL,
    headers: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : undefined,
  })
}
