import { fetchRunningServices } from '../fetch/portal-backend.js'
import { bulkUpdateTags } from '../database/manage-tags.js'

/**
 * Pulls list of deployments from portal backend. This is just for testing/debugging.
 * When deployed the expectation is portal will push deployments via the push endpoint.
 */
const pullDeploymentsController = {
  options: {},
  handler: async (request, h) => {
    const runningServices = await fetchRunningServices()

    const tags = runningServices.map((d) => ({
      name: d.service,
      version: d.version,
      value: d.environment
    }))
    const result = await bulkUpdateTags(request, tags, true)
    request.logger.info(
      `refreshed deployments ${runningServices.length} received, ${result} updated`
    )
    return h.response(result).code(200)
  }
}

export { pullDeploymentsController }
