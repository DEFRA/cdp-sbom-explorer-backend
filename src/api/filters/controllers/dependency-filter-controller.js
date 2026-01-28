import { uniqueDependencies } from '../database/filter-queries.js'
import Joi from 'joi'

const dependencyFilterController = {
  options: {
    validate: {
      query: Joi.object({
        name: Joi.string().trim().min(1),
        partialName: Joi.string().trim().min(1),
        type: Joi.string().trim().min(1)
      })
        .unknown(true)
        .options({ stripUnknown: true })
    }
  },
  handler: async (request, h) => {
    const query = request.query
    if (query.partialName) {
      if (!query.partialName.endsWith('%')) {
        query.partialName = query.partialName + '%'
      }
    }
    const result = await uniqueDependencies(request.pg, query)
    return h.response(result).code(200)
  }
}

export { dependencyFilterController }
