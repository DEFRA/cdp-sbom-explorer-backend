import Joi from 'joi'
import { listDependencies } from '../database/listDependents.js'

export default {
  options: {
    validate: {
      params: Joi.object({
        entityName: Joi.string().trim().required()
      }),
      query: Joi.object({
        entityVersion: Joi.string().trim(),
        version: Joi.string().trim(),
        type: Joi.string().trim(),
        name: Joi.string().trim()
      })
    }
  },
  handler: async (request, h) => {
    const searchQuery = {
      ...request.query,
      ...request.params
    }

    const matches = await listDependencies(request.pg, searchQuery)
    return h.response(matches).code(200)
  }
}
