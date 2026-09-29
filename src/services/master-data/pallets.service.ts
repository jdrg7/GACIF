import { createResourceService } from '../resource.factory'
import type { Pallet } from '../../types/master-data'
import type { CreatePalletInput, UpdatePalletInput } from '../../types/master-data-inputs'

export const palletsService = createResourceService<Pallet, CreatePalletInput, UpdatePalletInput>(
  '/master-data/pallets',
)
