import { pullDeploymentsController } from './controllers/pull-deployments.js'
import { updateLatestDeployments } from './controllers/update-latest-deployments.js'
import { pushDeploymentsController } from './controllers/push-deployments.js'

const deploymentsRoutes = [
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
    ...updateLatestDeployments
  },
  {
    // Allows portal backend and other systems to push updates about deployments etc
    method: 'POST',
    path: '/deployments/update',
    ...pushDeploymentsController
  }
]

export { deploymentsRoutes }
