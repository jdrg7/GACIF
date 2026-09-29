import { RouterProvider } from 'react-router'
import { router } from './router'
import { useAuthBootstrap } from './hooks/useAuthBootstrap'
import { Spinner } from './components/ui/Spinner'

function App() {
  const { isInitializing } = useAuthBootstrap()

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return <RouterProvider router={router} />
}

export default App
