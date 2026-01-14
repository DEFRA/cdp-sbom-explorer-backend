import { uniqueDependenciesFiltered } from '../database/filter-queries.js'

const dependencyFilterController = {
  options: {},
  handler: async (request, h) => {
    const type = request.query.type
    const partialName = request.query.name

    const result = await uniqueDependenciesFiltered(
      request.pg,
      type,
      partialName
    )
    return h.response(result).code(200)
  }
}

export { dependencyFilterController }
