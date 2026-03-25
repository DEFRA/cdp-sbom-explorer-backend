import { semverToBigint } from '../../importer/helpers/semver-to-bigint.js'
import Joi from 'joi'
import { listDependents } from '../database/listDependents.js'

export default {
  options: {
    validate: {
      params: Joi.object({
        type: Joi.string().trim().required(),
        name: Joi.string().trim().required()
      }),
      query: Joi.object({
        gte: Joi.string().trim(),
        lte: Joi.string().trim(),
        environment: Joi.string().trim()
      })
    }
  },
  handler: async (request, h) => {
    const searchQuery = {
      ...request.query,
      ...request.params
    }

    if (searchQuery.gte) {
      searchQuery.gte = semverToBigint(searchQuery.gte)
    }

    if (searchQuery.lte) {
      searchQuery.lte = semverToBigint(searchQuery.lte)
    }

    const matches = await listDependents(request.pg, searchQuery)
    return h.response(matches).code(200)
  }
}
