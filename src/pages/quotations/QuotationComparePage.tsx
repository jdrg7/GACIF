import { useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { QuotationComparator } from '../../components/quotation/QuotationComparator'
import { quotationsService } from '../../services/quotations.service'

export function QuotationComparePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialOpp = searchParams.get('opportunity_id') ?? ''
  const [inputValue, setInputValue] = useState(initialOpp)
  const opportunityId = searchParams.get('opportunity_id')

  const { data: quotations, isLoading, isFetched } = useQuery({
    queryKey: ['quotations-compare', opportunityId],
    queryFn: () => quotationsService.compareByOpportunity(Number(opportunityId)),
    enabled: Boolean(opportunityId),
  })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = inputValue.trim()
    if (trimmed) setSearchParams({ opportunity_id: trimmed })
  }

  return (
    <PageWrapper title="Comparativa por OPP">
      <form onSubmit={handleSubmit} className="flex max-w-sm items-end gap-2">
        <Input
          label="Número de OPP"
          type="number"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
        />
        <Button type="submit">Buscar</Button>
      </form>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {!opportunityId && !isLoading && (
        <p className="text-sm text-gray-400">Ingresa un número de OPP para ver sus cotizaciones lado a lado.</p>
      )}

      {isFetched && quotations && (
        <QuotationComparator quotations={quotations} onSelect={(q) => navigate(`/quotations/${q.id}`)} />
      )}
    </PageWrapper>
  )
}
