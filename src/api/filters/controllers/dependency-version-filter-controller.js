import { uniqueVersionForDependency } from '../database/filter-queries.js'
import Boom from '@hapi/boom'

const dependencyVersionFilterController = {
  options: {},
  handler: async (request, h) => {
    const type = request.params.type
    const name = request.params.name
    if (!name) {
      return Boom.badRequest('Name required')
    }
    const result = await uniqueVersionForDependency(request.pg, name, type)
    return h.response(result).code(200)
  }
}

export { dependencyVersionFilterController }
