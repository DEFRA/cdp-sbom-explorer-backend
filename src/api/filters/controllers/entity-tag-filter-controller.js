import { uniqueEntityTags } from '../database/filter-queries.js'

/**
 * Returns unique tags (latest, etc).
 */
const entityTagFilterController = {
  options: {},
  handler: async (request, h) => {
    const result = await uniqueEntityTags(request.pg)
    return h.response(result).code(200)
  }
}

export { entityTagFilterController }
