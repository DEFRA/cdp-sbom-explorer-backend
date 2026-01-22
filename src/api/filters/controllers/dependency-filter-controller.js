import { uniqueDependencies } from '../database/filter-queries.js'

const dependencyFilterController = {
  options: {},
  handler: async (request, h) => {
    const result = await uniqueDependencies(request.pg, request.query)
    return h.response(result).code(200)
  }
}

export { dependencyFilterController }
