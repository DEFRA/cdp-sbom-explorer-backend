import Boom from '@hapi/boom'

import { deploymentsForEnvSchema } from '../schemas/deployments-for-env-schema.js'
import { updateDeploymentEnvironment } from '../database/update-deployment-environment.js'

/**
 * Receives per-environment deployment updates pushed from an external source.
 * Expects { environment: 'dev', version: [{name: 'foo', version: '1.2.3'}] }
 */
const pushDeploymentsController = {
  options: {
    validate: {
      payload: deploymentsForEnvSchema,
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const payload = request?.payload
    const environment = payload.environment
    const deployments = payload.versions

    const result = await updateDeploymentEnvironment(
      request,
      environment,
      deployments
    )
    return h.response(result).code(200)
  }
}

export { pushDeploymentsController }
