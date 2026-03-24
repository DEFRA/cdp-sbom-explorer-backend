import Boom from '@hapi/boom'

import { schemas } from '../schemas/schemas.js'
import { bulkUpdateTags } from '../database/manage-tags.js'

/**
 * Receives per-environment deployment updates pushed from an external source.
 * Expects { environment: 'dev', version: [{name: 'foo', version: '1.2.3'}] }
 */
const pushDeploymentsController = {
  options: {
    validate: {
      payload: schemas,
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const payload = request?.payload
    const environment = payload.environment
    const deployments = payload.versions

    const result = await bulkUpdateTags(
      request,
      deployments.map((d) => ({
        name: d.name,
        version: d.version,
        value: environment
      })),
      true
    )
    return h
      .response({
        environment,
        deploymentsProvided: deployments.length,
        result
      })
      .code(200)
  }
}

export { pushDeploymentsController }
