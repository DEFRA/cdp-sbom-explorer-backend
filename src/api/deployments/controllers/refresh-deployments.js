import { fetchRunningServices } from '../fetch/fetch-running-services.js'
import { updateDeployments } from '../database/update-deployments.js'
import { updateLatest } from '../database/update-latest.js'

const refreshDeploymentsController = {
  options: {},
  handler: async (request, h) => {
    const runningServices = await fetchRunningServices()
    const result = await updateDeployments(request, runningServices)
    request.logger.info(
      `refreshed deployments ${runningServices.length} received, ${result.inserted} updated`
    )

    const latestResult = await updateLatest(request)
    request.logger.info(`refreshed latest, ${latestResult.inserted} updated`)

    return h.response(result).code(200)
  }
}

export { refreshDeploymentsController }
