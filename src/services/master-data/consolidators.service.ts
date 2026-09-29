import { createResourceService } from '../resource.factory'
import type { Consolidator } from '../../types/master-data'
import type { CreateConsolidatorInput, UpdateConsolidatorInput } from '../../types/master-data-inputs'

export const consolidatorsService = createResourceService<Consolidator, CreateConsolidatorInput, UpdateConsolidatorInput>(
  '/master-data/consolidators',
)
