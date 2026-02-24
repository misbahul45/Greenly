import { createFileRoute } from '@tanstack/react-router'
import FormRegister from '@/components/auth/FormRegister'

export const Route = createFileRoute('/auth/regiister')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="w-full h-screen flex overflow-hidden">

      {/* LEFT SIDE - IMAGE */}
      <div className="hidden md:block w-1/2 h-full">
        <img
          src="/image/tampilanlogin.jpeg"
          alt="Register"
          className="w-full h-full object-cover"
        />
      </div>

      {/* RIGHT SIDE - REGISTER FORM */}
      <div
        className="w-full md:w-1/2 h-full flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #d6dfcd)"
        }}
      >
        <div className="w-full max-w-md px-6">
          <FormRegister />
        </div>
      </div>

    </div>
  )
}
