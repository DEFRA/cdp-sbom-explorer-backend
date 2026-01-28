import { uniqueDependencyTypes } from '../database/filter-queries.js'

/**
 * Returns all the unique dependency types (npm, apk, nuget etc)
 */
const dependencyTypeFilterController = {
  options: {},
  handler: async (request, h) => {
    const result = await uniqueDependencyTypes(request.pg)
    return h.response(result).code(200)
  }
}

export { dependencyTypeFilterController }
