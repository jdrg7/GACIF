import type { ReactNode } from 'react'

interface PageWrapperProps {
  title: string
  actions?: ReactNode
  children: ReactNode
}

export function PageWrapper({ title, actions, children }: PageWrapperProps) {
  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">{title}</h1>
        {actions}
      </div>
      {children}
    </div>
  )
}
