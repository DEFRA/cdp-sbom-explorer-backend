import { refreshDeploymentsController } from './controllers/refresh-deployments.js'

const deploymentsRoutes = [
  {
    method: 'POST',
    path: '/refresh-deployments',
    ...refreshDeploymentsController
  }
]

export { deploymentsRoutes }
