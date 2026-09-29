import { createResourceService } from '../resource.factory'
import type { Country } from '../../types/master-data'
import type { CreateCountryInput, UpdateCountryInput } from '../../types/master-data-inputs'

export const countriesService = createResourceService<Country, CreateCountryInput, UpdateCountryInput>(
  '/master-data/countries',
)
