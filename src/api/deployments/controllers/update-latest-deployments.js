import { fetchLatestVersions } from '../fetch/portal-backend.js'
import { updateDeploymentEnvironment } from '../database/update-deployment-environment.js'

const updateLatestDeployments = {
  options: {},
  handler: async (request, h) => {
    const latestVersions = await fetchLatestVersions()
    const latestResult = await updateDeploymentEnvironment(
      request,
      'latest',
      latestVersions
    )
    request.logger.info(`refreshed latest, ${latestResult.inserted} updated`)
    return h.response(latestResult).code(200)
  }
}

export { updateLatestDeployments }
