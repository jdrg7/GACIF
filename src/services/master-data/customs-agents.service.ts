import { createResourceService } from '../resource.factory'
import type { CustomsAgent } from '../../types/master-data'
import type { CreateCustomsAgentInput, UpdateCustomsAgentInput } from '../../types/master-data-inputs'

export const customsAgentsService = createResourceService<CustomsAgent, CreateCustomsAgentInput, UpdateCustomsAgentInput>(
  '/master-data/customs-agents',
)
