import { createResourceService } from '../resource.factory'
import type { Product } from '../../types/master-data'
import type { CreateProductInput, UpdateProductInput } from '../../types/master-data-inputs'

export const productsService = createResourceService<Product, CreateProductInput, UpdateProductInput>(
  '/master-data/products',
)
