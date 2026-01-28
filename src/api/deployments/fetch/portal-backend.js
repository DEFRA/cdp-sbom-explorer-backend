import { config } from '../../../config.js'
import { fetch } from 'undici'

async function fetchRunningServices() {
  const baseUrl = config.get('portalBackendUrl')

  const runningServicesUrl = new URL('/running-services', baseUrl)
  const resp = await fetch(runningServicesUrl, { method: 'GET' })
  if (resp.status === 200) {
    return resp.json()
  }
  throw Error(`Unable to fetch running services for ${runningServicesUrl}`)
}

/**
 *
 * @return {Promise<{name: string, version: string}[]>}
 */
async function fetchLatestVersions() {
  const baseUrl = config.get('portalBackendUrl')

  const latestVersionsUrl = new URL('/latest-artifacts', baseUrl)
  const resp = await fetch(latestVersionsUrl, { method: 'GET' })
  if (resp.status === 200) {
    return resp.json()
  }
  throw Error(`Unable to fetch latest versions for ${latestVersionsUrl}`)
}

export { fetchRunningServices, fetchLatestVersions }
