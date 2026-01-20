import { findByDependencies } from '../database/search-queries.js'
import { semverToBigint } from '../../importer/helpers/semver-to-bigint.js'
import Joi from 'joi'

/**
 * API for searching for which entities use a given dependency.
 * API optionally allows for searching by a specific version
 * or by a range over versions.
 * @type {{options: {}, handler: function(*, *): Promise<*>}}
 */
const dependencySearchController = {
  options: {
    validate: {
      query: Joi.object({
        name: Joi.string().required(),
        version: Joi.string(),
        type: Joi.string(),
        gte: Joi.string(),
        lte: Joi.string(),
        environment: Joi.string()
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

    const matches = await findByDependencies(request.pg, searchQuery)
    return h.response(matches).code(200)
  }
}

export { dependencySearchController }
