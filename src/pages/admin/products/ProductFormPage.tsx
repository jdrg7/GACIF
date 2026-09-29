import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router'
import axios from 'axios'
import { AdminFormShell } from '../../../components/admin/AdminFormShell'
import { FieldRenderer, type AdminFieldConfig } from '../../../components/admin/FieldRenderer'
import { Button } from '../../../components/ui/Button'
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog'
import { Spinner } from '../../../components/ui/Spinner'
import { usePermissions } from '../../../hooks/usePermissions'
import { productsService } from '../../../services/master-data/products.service'
import { suppliersService } from '../../../services/master-data/suppliers.service'
import { cleanPayload } from '../../../utils/clean-payload'
import { Permission } from '../../../utils/permissions'
import { productSchema, type ProductFormInput, type ProductFormValues } from './product.schema'

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && error.response?.data?.error?.message) return error.response.data.error.message
  return fallback
}

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission(Permission.MASTER_DATA_EDIT)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isDeleteOpen, setDeleteOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['products', id],
    queryFn: () => productsService.getById(id!),
    enabled: isEdit,
  })
  const { data: suppliers } = useQuery({ queryKey: ['suppliers', { limit: 100 }], queryFn: () => suppliersService.list({ limit: 100 }) })

  const FIELDS: AdminFieldConfig<ProductFormInput>[] = [
    { name: 'name', label: 'Nombre', type: 'text' },
    { name: 'description', label: 'Descripción', type: 'textarea' },
    { name: 'sku', label: 'SKU', type: 'text' },
    {
      name: 'supplier_id',
      label: 'Proveedor (opcional)',
      type: 'select',
      options: [{ value: '', label: 'Sin proveedor' }, ...(suppliers?.data ?? []).map((s) => ({ value: s.id, label: s.name }))],
    },
    { name: 'weight_kg', label: 'Peso (KG)', type: 'number', step: '0.001' },
    { name: 'volume_cft', label: 'Volumen (CFT)', type: 'number', step: '0.001' },
    { name: 'customs_code', label: 'Código arancelario', type: 'text' },
  ]

  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    values: data
      ? {
          name: data.name,
          description: data.description ?? '',
          sku: data.sku ?? '',
          supplier_id: data.supplier_id ?? '',
          weight_kg: data.weight_kg,
          volume_cft: data.volume_cft,
          customs_code: data.customs_code ?? '',
          is_active: data.is_active,
        }
      : { name: '', description: '', sku: '', supplier_id: '', weight_kg: 0, volume_cft: 0, customs_code: '', is_active: true },
  })

  const saveMutation = useMutation({
    mutationFn: (values: ProductFormValues) => {
      const payload = cleanPayload(values)
      return isEdit ? productsService.update(id!, payload) : productsService.create(payload as never)
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      navigate(`/admin/products/${saved.id}`, { replace: true })
    },
    onError: (error) => setServerError(extractErrorMessage(error, 'No se pudo guardar')),
  })

  const deleteMutation = useMutation({
    mutationFn: () => productsService.remove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      navigate('/admin/products')
    },
    onError: (error) => setServerError(extractErrorMessage(error, 'No se pudo eliminar')),
  })

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  return (
    <AdminFormShell
      title={isEdit ? data?.name ?? 'Producto' : 'Nuevo producto'}
      onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
      serverError={serverError}
      isSubmitting={saveMutation.isPending}
      onCancel={() => navigate('/admin/products')}
      extraActions={
        isEdit &&
        canEdit && (
          <Button type="button" variant="danger" onClick={() => setDeleteOpen(true)}>
            Eliminar
          </Button>
        )
      }
    >
      <fieldset disabled={!canEdit} className="contents">
        <FieldRenderer fields={FIELDS} register={register} errors={errors} />
        {isEdit && (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" {...register('is_active')} />
            Activo
          </label>
        )}
      </fieldset>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Eliminar producto"
        message="¿Confirmas eliminar este producto?"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false)
          deleteMutation.mutate()
        }}
      />
    </AdminFormShell>
  )
}
