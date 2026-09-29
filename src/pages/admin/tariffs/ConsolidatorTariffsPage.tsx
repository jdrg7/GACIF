import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { AdminListShell } from '../../../components/admin/AdminListShell'
import { Select } from '../../../components/ui/Select'
import { usePagination } from '../../../hooks/usePagination'
import { usePermissions } from '../../../hooks/usePermissions'
import { consolidatorTariffsService } from '../../../services/tariffs/consolidator-tariffs.service'
import { consolidatorsService } from '../../../services/master-data/consolidators.service'
import { countriesService } from '../../../services/master-data/countries.service'
import { Permission } from '../../../utils/permissions'
import { TransportType } from '../../../utils/constants'
import { formatDate } from '../../../utils/formatters'
import type { ConsolidatorTariff } from '../../../types/tariff'

export function ConsolidatorTariffsPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const { page, limit, setPage } = usePagination()
  const [consolidatorId, setConsolidatorId] = useState('')
  const [transportType, setTransportType] = useState('')

  const { data: consolidators } = useQuery({ queryKey: ['consolidators', { limit: 100 }], queryFn: () => consolidatorsService.list({ limit: 100 }) })
  const { data: countries } = useQuery({ queryKey: ['countries', { limit: 100 }], queryFn: () => countriesService.list({ limit: 100 }) })
  const countryNameById = new Map((countries?.data ?? []).map((c) => [c.id, c.name]))

  const { data, isLoading } = useQuery({
    queryKey: ['consolidator-tariffs', { page, limit, consolidatorId, transportType }],
    queryFn: () =>
      consolidatorTariffsService.list({
        page,
        limit,
        consolidator_id: consolidatorId || undefined,
        transport_type: transportType || undefined,
      }),
  })

  const canEdit = hasPermission(Permission.TARIFF_EDIT)

  return (
    <AdminListShell<ConsolidatorTariff>
      title="Tarifas de consolidador"
      onNew={canEdit ? () => navigate('/admin/tariffs/consolidator/new') : undefined}
      filters={
        <>
          <div className="w-56">
            <Select
              options={[{ value: '', label: 'Todos los consolidadores' }, ...(consolidators?.data ?? []).map((c) => ({ value: c.id, label: c.name }))]}
              value={consolidatorId}
              onChange={(e) => { setConsolidatorId(e.target.value); setPage(1) }}
            />
          </div>
          <div className="w-48">
            <Select
              options={[
                { value: '', label: 'Todos los transportes' },
                { value: TransportType.AEREO, label: 'Aéreo' },
                { value: TransportType.MARITIMO, label: 'Marítimo' },
              ]}
              value={transportType}
              onChange={(e) => { setTransportType(e.target.value); setPage(1) }}
            />
          </div>
        </>
      }
      rows={data?.data ?? []}
      isLoading={isLoading}
      page={data?.meta.page ?? page}
      totalPages={data?.meta.totalPages ?? 1}
      onPageChange={setPage}
      getRowKey={(row) => row.id}
      emptyMessage="No hay tarifas de consolidador"
      columns={[
        { header: 'Nombre', render: (row) => row.name },
        { header: 'País', render: (row) => countryNameById.get(row.country_id) ?? '—' },
        { header: 'Transporte', render: (row) => row.transport_type },
        { header: 'Vigencia', render: (row) => `${formatDate(row.valid_from)} — ${row.valid_until ? formatDate(row.valid_until) : 'indefinida'}` },
        {
          header: 'Estado',
          render: (row) => <span className={row.is_active ? 'text-green-700' : 'text-gray-400'}>{row.is_active ? 'Activa' : 'Inactiva'}</span>,
        },
        {
          header: '',
          render: (row) => (
            <button type="button" className="text-blue-600 hover:underline" onClick={() => navigate(`/admin/tariffs/consolidator/${row.id}`)}>
              {canEdit ? 'Editar' : 'Ver'}
            </button>
          ),
        },
      ]}
    />
  )
}
