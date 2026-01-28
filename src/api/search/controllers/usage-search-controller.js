import Joi from 'joi'
import { versionUsage } from '../database/usage-queries.js'

/**
 * API for searching for which entities use a given dependency.
 * API optionally allows for searching by a specific version
 * or by a range over versions.
 */
const usageSearchController = {
  options: {
    validate: {
      query: Joi.object({
        type: Joi.string().trim().min(1),
        partialName: Joi.string().trim().min(1).required(),
        environment: Joi.string().trim().min(1)
      })
    }
  },
  handler: async (request, h) => {
    const { type, partialName, environment } = request.query

    const wildcard = partialName.endsWith('*') ? '%' : ''

    const matches = await versionUsage(
      request.pg,
      type,
      partialName.replace('*', '') + wildcard,
      environment
    )
    return h.response(matches).code(200)
  }
}

export { usageSearchController }
