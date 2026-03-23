import { pullDeploymentsController } from './controllers/pull-deployments.js'
import { pushLatestVersions } from './controllers/push-latest-versions.js'
import { pushDeploymentsController } from './controllers/push-deployments.js'
import { pushTeamsController } from './controllers/push-teams.js'

const metadataRoutes = [
  {
    // Temp endpoint for testing. Pulls from portal backend.
    method: 'POST',
    path: '/deployments/pull',
    ...pullDeploymentsController
  },
  {
    // Test endpoint, pulls latest versions from PBE
    method: 'POST',
    path: '/deployments/latest',
    ...pushLatestVersions
  },
  {
    // Allows portal backend and other systems to push updates about deployments etc
    method: 'POST',
    path: '/deployments/update',
    ...pushDeploymentsController
  },
  {
    // Allows portal backend and other systems to push updates about deployments etc
    method: 'POST',
    path: '/metadata/tags/latest',
    ...pushLatestVersions
  },
  {
    // Allows portal backend and other systems to push updates about deployments etc
    method: 'POST',
    path: '/metadata/tags/deployments',
    ...pushDeploymentsController
  },
  {
    method: 'POST',
    path: '/metadata/labels/teams',
    ...pushTeamsController
  }
]

export { metadataRoutes }
