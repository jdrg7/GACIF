import type { FormEvent, ReactNode } from 'react'
import { PageWrapper } from '../layout/PageWrapper'
import { Button } from '../ui/Button'

interface AdminFormShellProps {
  title: string
  onSubmit: (event: FormEvent) => void
  children: ReactNode
  serverError?: string | null
  isSubmitting?: boolean
  onCancel: () => void
  submitLabel?: string
  extraActions?: ReactNode
}

export function AdminFormShell({
  title,
  onSubmit,
  children,
  serverError,
  isSubmitting,
  onCancel,
  submitLabel = 'Guardar',
  extraActions,
}: AdminFormShellProps) {
  return (
    <PageWrapper title={title}>
      <form onSubmit={onSubmit} className="flex max-w-lg flex-col gap-4">
        {children}

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <div className="flex items-center justify-between">
          <div>{extraActions}</div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : submitLabel}
            </Button>
          </div>
        </div>
      </form>
    </PageWrapper>
  )
}
