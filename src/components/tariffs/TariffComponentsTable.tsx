import { Button } from '../ui/Button'
import { EmptyState } from '../shared/EmptyState'
import type { TariffComponent } from '../../types/tariff'

interface TariffComponentsTableProps {
  components: TariffComponent[]
  onEdit: (component: TariffComponent) => void
  onDelete: (component: TariffComponent) => void
  onAdd: () => void
}

export function TariffComponentsTable({ components, onEdit, onDelete, onAdd }: TariffComponentsTableProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Componentes</h3>
        <Button type="button" variant="secondary" onClick={onAdd}>
          Agregar componente
        </Button>
      </div>

      {components.length === 0 ? (
        <EmptyState message="Sin componentes — agrega al menos uno" />
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-1.5 pr-2">Nombre</th>
              <th className="py-1.5 pr-2">Tipo</th>
              {components.some((c) => c.is_optional !== undefined) && <th className="py-1.5 pr-2">Opcional</th>}
              <th className="py-1.5" />
            </tr>
          </thead>
          <tbody>
            {[...components]
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((component) => (
                <tr key={component.id} className="border-b border-gray-100">
                  <td className="py-1.5 pr-2">
                    {component.name}
                    {component.is_tax && (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">
                        Impuesto — no se suma
                      </span>
                    )}
                    {component.service_level && (
                      <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
                        {component.service_level === 'PRIORITY' ? 'Solo Priority' : 'Solo Regular'}
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 pr-2">
                    {component.calculation_type}
                    {component.basis_candidates && component.basis_candidates.length > 0 && (
                      <span className="block text-xs text-gray-500">
                        Mayor de:{' '}
                        {component.basis_candidates
                          .map((c) => `${c.basis} ×${c.rate}${c.minimum ? ` (mín ${c.minimum})` : ''}`)
                          .join(' | ')}
                      </span>
                    )}
                  </td>
                  {components.some((c) => c.is_optional !== undefined) && (
                    <td className="py-1.5 pr-2">{component.is_optional ? 'Sí' : 'No'}</td>
                  )}
                  <td className="py-1.5 text-right">
                    <button type="button" className="mr-3 text-blue-600 hover:underline" onClick={() => onEdit(component)}>
                      Editar
                    </button>
                    <button type="button" className="text-red-600 hover:underline" onClick={() => onDelete(component)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
