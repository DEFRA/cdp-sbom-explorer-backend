import { uniqueEntityStages } from '../database/filter-queries.js'

/**
 * Returns unique stages (run, development, etc).
 */
const entityStageFilterController = {
  options: {},
  handler: async (request, h) => {
    const result = await uniqueEntityStages(request.pg)
    return h.response(result).code(200)
  }
}

export { entityStageFilterController }
