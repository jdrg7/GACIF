import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface ResetPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (newPassword: string) => void
  isSubmitting?: boolean
  error?: string | null
}

export function ResetPasswordModal({ isOpen, onClose, onConfirm, isSubmitting, error }: ResetPasswordModalProps) {
  const [password, setPassword] = useState('')
  const canSubmit = password.length >= 8

  function handleClose() {
    setPassword('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Restablecer contraseña">
      <div className="flex flex-col gap-4">
        <Input
          label="Nueva contraseña"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button disabled={!canSubmit || isSubmitting} onClick={() => onConfirm(password)}>
            {isSubmitting ? 'Guardando...' : 'Confirmar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
