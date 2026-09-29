import { createResourceService } from '../resource.factory'
import type { Client } from '../../types/master-data'
import type { CreateClientInput, UpdateClientInput } from '../../types/master-data-inputs'

export const clientsService = createResourceService<Client, CreateClientInput, UpdateClientInput>(
  '/master-data/clients',
)
