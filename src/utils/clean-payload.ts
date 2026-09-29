// Los formularios usan '' como "vacío" para poder controlar inputs opcionales con
// React Hook Form; el backend espera que esos campos estén ausentes (undefined),
// no strings vacíos, para que sus validadores `.optional()` los acepten.
export function cleanPayload<T extends Record<string, unknown>>(input: T): Partial<T> {
  const result: Partial<T> = {}
  for (const [key, value] of Object.entries(input)) {
    if (value !== '' && value !== undefined) {
      result[key as keyof T] = value as T[keyof T]
    }
  }
  return result
}
