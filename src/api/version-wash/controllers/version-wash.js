import { semverToBigint } from '../../importer/helpers/semver-to-bigint.js'
import {
  listDependencyVersions,
  updateDependencyVersions
} from '../database/dependency-versions.js'

export default {
  handler: async (request, h) => {
    try {
      await request.pg.query('BEGIN')

      for await (const dependencies of listDependencyVersions(
        request.pg,
        request.logger
      )) {
        for (const dependency of dependencies) {
          dependency.versionNum = semverToBigint(dependency.version)
        }

        request.logger.info(
          `Washing dependencies with Id ${dependencies.at(0).id} to ${dependencies.at(-1).id}`
        )

        await updateDependencyVersions(request.pg, request.logger, dependencies)
      }

      await request.pg.query('COMMIT')
    } catch (e) {
      await request.pg.query('ROLLBACK')
      throw e
    }

    return h.response('Done').code(200)
  }
}
