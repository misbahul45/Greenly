import {
  HeadContent,
  Scripts,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"
import appCss from "../styles.css?url"
import TanStackQueryProvider from "../integrations/tanstack-query/root-provider"
import { Toaster } from "sonner"

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Greenly Mart" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument,
})

function RootDocument() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-background">
        <Toaster />
        <TanStackQueryProvider>
          <Outlet />
        </TanStackQueryProvider>
        <Scripts />
      </body>
    </html>
  )
}