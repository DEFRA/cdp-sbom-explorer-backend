import { uniqueVersionForDependency } from '../database/filter-queries.js'
import Joi from 'joi'

const dependencyVersionFilterController = {
  options: {
    validate: {
      params: Joi.object({
        type: Joi.string().trim().min(1).required(),
        name: Joi.string().trim().min(1).required()
      })
    }
  },
  handler: async (request, h) => {
    const type = request.params.type
    const name = request.params.name
    const result = await uniqueVersionForDependency(request.pg, name, type)
    return h.response(result).code(200)
  }
}

export { dependencyVersionFilterController }
