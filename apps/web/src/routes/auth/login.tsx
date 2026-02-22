import FormLogin from '@/components/auth/FormLogin'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="w-full h-screen flex overflow-hidden">

      {/* LEFT SIDE - IMAGE */}
      <div className="hidden md:block w-1/2 h-full">
        <img
          src="/image/tampilanlogin.jpeg"
          alt="Login"
          className="w-full h-full object-cover"
        />
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div
        className="w-full md:w-1/2 h-full flex items-center justify-center"
        style={{ backgroundColor: "#d6dfcd" }}
      >
        <div className="w-full max-w-md px-6">
          <FormLogin />
        </div>
      </div>

    </div>
  )
}
