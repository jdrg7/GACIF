import { createResourceService } from '../resource.factory'
import type { Supplier } from '../../types/master-data'
import type { CreateSupplierInput, UpdateSupplierInput } from '../../types/master-data-inputs'

export const suppliersService = createResourceService<Supplier, CreateSupplierInput, UpdateSupplierInput>(
  '/master-data/suppliers',
)
