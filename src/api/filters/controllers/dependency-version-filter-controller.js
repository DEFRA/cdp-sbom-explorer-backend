import { uniqueVersionForDependency } from '../database/filter-queries.js'
import Boom from '@hapi/boom'

const dependencyVersionFilterController = {
  options: {},
  handler: async (request, h) => {
    const name = request.param.name
    if (!name) {
      return Boom.badRequest('Name required')
    }
    const result = await uniqueVersionForDependency(request.pg, name)
    return h.response(result).code(200)
  }
}

export { dependencyVersionFilterController }
