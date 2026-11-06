import { semverToBigint } from '../../importer/helpers/semver-to-bigint.js'
import { listDependencyVersions } from '../database/dependency-versions.js'

export default {
  handler: async (request, h) => {
    for await (const dependencies of listDependencyVersions(request.pg, request.logger)) {

      for (const dependency of dependencies) {
        dependency.versionNum = semverToBigint(dependency.version)
      }

      request.logger.info(`Washing dependencies with Id ${dependencies.at(0).id} to ${dependencies.at(-1).id}`)

      // console.table(dependencies)
    }

    return h
      .response('Done')
      .code(200)
  }
}
