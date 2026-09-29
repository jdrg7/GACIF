import { useQuery } from '@tanstack/react-query'
import { PageWrapper } from '../../../components/layout/PageWrapper'
import { Table } from '../../../components/ui/Table'
import { Spinner } from '../../../components/ui/Spinner'
import { EmptyState } from '../../../components/shared/EmptyState'
import { currenciesService } from '../../../services/master-data/currencies.service'

export function CurrenciesListPage() {
  const { data, isLoading } = useQuery({ queryKey: ['currencies'], queryFn: () => currenciesService.list() })

  return (
    <PageWrapper title="Monedas">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState message="No hay monedas" />
      ) : (
        <Table
          rows={data}
          getRowKey={(row) => row.id}
          columns={[
            { header: 'Código', render: (row) => row.code },
            { header: 'Nombre', render: (row) => row.name },
            { header: 'Símbolo', render: (row) => row.symbol },
          ]}
        />
      )}
    </PageWrapper>
  )
}
