import Joi from 'joi'
import { listDependencies } from '../database/listDependencies.js'

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
        name: Joi.string().trim(),
        stage: Joi.string().trim(),
        page: Joi.number().integer().default(1).min(1),
        size: Joi.number().integer().default(50).min(1).max(100)
      })
    }
  },
  handler: async (request, h) => {
    const searchQuery = {
      ...request.query,
      ...request.params
    }

    const { rows, meta } = await listDependencies(
      request.pg,
      searchQuery,
      request.metrics()
    )

    return h
      .response(rows)
      .header('X-Total-Count', meta.total)
      .header('X-Total-Pages', meta.totalPages)
      .code(200)
  }
}
