import { fetchLatestVersions } from '../fetch/portal-backend.js'
import { bulkUpdateTags } from '../database/manage-tags.js'

/**
 * Allows an external system (portal-backend) to push an updated list of what the latest version of a
 * service/test suite is?
 */
const pushLatestVersions = {
  options: {},
  handler: async (request, h) => {
    const latestVersions = await fetchLatestVersions()

    const tags = latestVersions.map(
      (v) => ({ name: v.name, version: v.version, value: 'latest' }),
      true
    )
    const latestResult = await bulkUpdateTags(request, tags)
    request.logger.info(`refreshed latest, ${latestResult} updated`)
    return h.response(latestResult).code(200)
  }
}

export { pushLatestVersions }
