import { config } from '../../../config.js'
import { fetch } from 'undici'

async function fetchRunningServices() {
  const baseUrl = config.get('portalBackendUrl')

  const runningServicesUrl = new URL('/running-services', baseUrl)
  const resp = await fetch(runningServicesUrl, { method: 'GET' })
  if (resp.status === 200) {
    return resp.json()
  }
  throw Error(`Unable to fetch running services for ${baseUrl}`)
}

export { fetchRunningServices }
