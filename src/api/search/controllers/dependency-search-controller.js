import { searchDependencies } from '../database/search-queries.js'
import { semverToBigint } from '../../importer/helpers/semver-to-bigint.js'
import Joi from 'joi'

/**
 * API for searching for which entities use a given dependency.
 * API optionally allows for searching by a specific version
 * or by a range over versions.
 */
const dependencySearchController = {
  options: {
    validate: {
      query: Joi.object({
        name: Joi.string().trim().min(1).required(),
        version: Joi.string().trim().min(1),
        type: Joi.string().trim().min(1),
        gte: Joi.string().trim().min(1),
        lte: Joi.string().trim().min(1),
        environment: Joi.string().trim().min(1)
      })
    }
  },
  handler: async (request, h) => {
    const searchQuery = request.query

    if (searchQuery.gte) {
      searchQuery.gte = semverToBigint(searchQuery.gte)
    }

    if (searchQuery.lte) {
      searchQuery.lte = semverToBigint(searchQuery.lte)
    }

    const matches = await searchDependencies(request.pg, searchQuery)
    return h.response(matches).code(200)
  }
}

export { dependencySearchController }
