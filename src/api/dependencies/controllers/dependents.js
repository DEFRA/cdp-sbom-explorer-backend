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
        gteVersion: Joi.string().trim(),
        lteVersion: Joi.string().trim(),
        environment: Joi.string().trim(),
        team: Joi.string().trim(),
        tag: Joi.string().trim(),
        entity: Joi.string().trim(),
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

    if (searchQuery.gteVersion) {
      searchQuery.gteVersion = semverToBigint(searchQuery.gteVersion)
    }

    if (searchQuery.lteVersion) {
      searchQuery.lteVersion = semverToBigint(searchQuery.lteVersion)
    }

    const limit = request.query.size
    const offset = (request.query.page - 1) * limit

    const { rows, meta } = await listDependents(
      request.pg,
      searchQuery,
      limit,
      offset,
      request.metrics()
    )

    return h
      .response(rows)
      .header('X-Total-Count', meta.total)
      .header('X-Total-Pages', meta.totalPages)
      .code(200)
  }
}
