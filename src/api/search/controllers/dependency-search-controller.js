import {
  findByDependencyName,
  findByDependencyNameVersion,
  findByDependencyNameVersionRange
} from '../database/search-queries.js'
import { semverToBigint } from '../../importer/helpers/semver-to-bigint.js'

/**
 * API for searching for which entities use a given dependency.
 * API optionally allows for searching by a specific version
 * or by a range over versions.
 * @type {{options: {}, handler: function(*, *): Promise<*>}}
 */
const dependencySearchController = {
  options: {},
  handler: async (request, h) => {
    const name = request.query.name
    const version = request.query.version
    const versionGte = request.query.versionGte
    const versionLte = request.query.versionLte

    if (!name) {
      return h.response({ message: 'name is required' }).code(400)
    }

    if (version) {
      const matches = await findByDependencyNameVersion(
        request.pg,
        name,
        version
      )
      return h.response(matches).code(200)
    }

    if (versionGte && versionLte) {
      const gte = semverToBigint(versionGte)
      const lte = semverToBigint(versionLte)
      const matches = await findByDependencyNameVersionRange(
        request.pg,
        name,
        gte,
        lte
      )
      return h.response(matches).code(200)
    }

    const matches = await findByDependencyName(request.pg, name)
    return h.response(matches).code(200)
  }
}

export { dependencySearchController }
