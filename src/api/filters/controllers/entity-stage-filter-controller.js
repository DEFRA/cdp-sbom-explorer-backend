import { uniqueEntityStages } from '../database/filter-queries.js'

const entityStageFilterController = {
  options: {},
  handler: async (request, h) => {
    const result = await uniqueEntityStages(request.pg)
    return h.response(result).code(200)
  }
}

export { entityStageFilterController }
