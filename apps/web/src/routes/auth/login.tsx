import FormLogin from '#/components/auth/FormLogin'
import { Card, CardFooter, CardHeader } from '#/components/ui/card'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className='w-full flex items-start h-screen'> 
     <div className="flex-1 ">
      <Card>
          <CardHeader>
            hallo
          </CardHeader>
          <CardFooter>
            halo
          </CardFooter>
      </Card>
     </div>
     <div className="flex-1 h-full flex flex-col items-center justify-center">
       <FormLogin />
     </div>
  </div>
}
