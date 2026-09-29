export function formatCurrency(amount: number, currency: 'USD' | 'HNL' = 'USD'): string {
  return new Intl.NumberFormat('es-HN', { style: 'currency', currency }).format(amount)
}

export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('es-HN', { dateStyle: 'medium' }).format(date)
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`
}
