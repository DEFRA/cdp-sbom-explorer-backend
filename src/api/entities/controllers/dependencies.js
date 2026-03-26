import { semverToBigint } from '../../importer/helpers/semver-to-bigint.js'
import Joi from 'joi'
import { listDependents } from '../database/listDependents.js'

export default {
  options: {
    validate: {
      params: Joi.object({
        name: Joi.string().trim().required()
      }),
      query: Joi.object({
        version: Joi.string().trim(),
        type: Joi.string().trim()
      })
    }
  },
  handler: async (request, h) => {
    const searchQuery = {
      ...request.query,
      ...request.params
    }

    if (searchQuery.gteVersion) {
      searchQuery.gteVersion = semverToBigint(searchQuery.gteVersion)
    }

    if (searchQuery.lteVersion) {
      searchQuery.lteVersion = semverToBigint(searchQuery.lteVersion)
    }

    const matches = await listDependents(request.pg, searchQuery)
    return h.response(matches).code(200)
  }
}
