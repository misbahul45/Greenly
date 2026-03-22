import FormLogin from '#/components/auth/FormLogin'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
<div className="w-full h-screen flex overflow-hidden">  
{/* LEFT SIDE */}
<div className="hidden md:flex md:w-1/2 h-full relative overflow-hidden bg-green-50">

  {/* background */}
  <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-green-100" />

  {/* blur */}
  <div className="absolute top-10 right-16 h-56 w-56 rounded-full bg-green-300 opacity-40 blur-3xl" />
  <div className="absolute bottom-20 left-12 h-44 w-44 rounded-full bg-green-200 opacity-40 blur-3xl" />

  {/* content */}
  <div className="relative z-10 flex h-full w-full flex-col px-8 pt-10 lg:px-14 lg:pt-12">

    {/* logo */}
<div className="mb-2 flex items-center gap-2">
  <img
    src="/Sidebar/LogoGreenly.png"
    alt="Logo"
    className="w-6 h-6 object-contain"
  />
  <h2 className="text-base font-semibold text-gray-900">
    Greenly Mart
  </h2>
</div>

    {/* heading */}
    <div className="max-w-md">
      <h1 className="mb-2 text-4xl lg:text-5xl font-bold leading-tight text-gray-900">
        Memberdayakan
        <br />
        UKM Pertanian
        <br />
        Indonesia.
      </h1>

      <p className="max-w-sm text-sm lg:text-base leading-relaxed text-gray-600">
        Platform digital terpercaya untuk mendistribusikan hasil tani berkualitas langsung ke pasar.
      </p>
    </div>

{/* IMAGE AREA */}
<div className="flex flex-1 items-end justify-center mt-2 relative">

  {/* base shadow */}
  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 h-44 w-72 rounded-3xl bg-white opacity-30" />

  <img
    src="/image/basket.png"
    alt="Basket"
    className="relative z-10 w-72 lg:w-80 object-contain drop-shadow-xl"
  />
</div>
  </div>
</div>

      {/* RIGHT SIDE - jangan diubah */}
      <div
        className="w-full md:w-1/2 h-full flex items-center justify-center"
        style={{ backgroundColor: '#F6F8F6' }}
      >
        <div className="w-full max-w-md px-6">
          <FormLogin />
        </div>
      </div>
    </div>
  )
}