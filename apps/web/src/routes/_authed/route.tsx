import { createFileRoute, redirect } from "@tanstack/react-router"
import { getCurrentUserFn } from "#/server/auth"

export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ location }) => {
    try {
      const user = await getCurrentUserFn()

      if (!user) {
        throw redirect({
          to: "/auth/login",
          search: { redirect: location.href },
        })
      }

      return { user }
    } catch (err: any) {
      if (err?.isRedirect) throw err
      throw redirect({
        to: "/auth/login",
        search: { redirect: location.href },
      })
    }
  },
})
