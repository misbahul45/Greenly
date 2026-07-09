import { createFileRoute, redirect } from "@tanstack/react-router"
import { getCurrentUserFn } from "#/server/auth"

export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ location }) => {
    try {
      const user = await getCurrentUserFn()

      if (!user) {
        throw new Error("Unauthenticated")
      }

      return { user }
    } catch {
      throw redirect({
        to: "/auth/login",
        search: { redirect: location.href },
      })
    }
  },
})
