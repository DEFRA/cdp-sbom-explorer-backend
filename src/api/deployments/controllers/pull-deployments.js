import { updateDeployments } from '../database/update-deployments.js'
import { fetchRunningServices } from '../fetch/portal-backend.js'

/**
 * Pulls latest deployments from portal backend. This is just for testing/debugging
 */
const pullDeploymentsController = {
  options: {},
  handler: async (request, h) => {
    const runningServices = await fetchRunningServices()
    const result = await updateDeployments(request, runningServices)
    request.logger.info(
      `refreshed deployments ${runningServices.length} received, ${result.inserted} updated`
    )
    return h.response(result).code(200)
  }
}

export { pullDeploymentsController }
