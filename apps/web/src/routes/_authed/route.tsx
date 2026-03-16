import { createFileRoute, redirect } from '@tanstack/react-router'
import { getCurrentUserFn } from '#/server/auth'
import type { LoginResponse } from '#/types/login.response';

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ location }) => {
    // const user = await getCurrentUserFn()
    const dataLogin: LoginResponse = {
          tokens: {
            accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik1pc2JhaHVsIE11dHRhcWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
            refreshToken: "dGhpcyBpcyBhIHJhbmRvbSByZWZyZXNoIHRva2VuIGV4YW1wbGUgMTIzNDU2Nzg5MA=="
          },
          user: {
            id: 1024,
            email: "misbahulmuttaqin395@gmail.com",
            name: "Misbahul Muttaqin",
            roles: ["user", "developer"]
          }
        };
    if (!dataLogin.user) {
      throw redirect({
        to: '/auth/login',
        search: { redirect: location.href },
      })
    }

    return { user:dataLogin.user }
  },
})