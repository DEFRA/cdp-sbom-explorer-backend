import { dependencySearchController } from './controllers/dependency-search-controller.js'
import { usageSearchController } from './controllers/usage-search-controller.js'

const searchRoutes = [
  {
    method: 'GET',
    path: '/search',
    ...dependencySearchController
  },
  {
    method: 'GET',
    path: '/usage',
    ...usageSearchController
  }
]

export { searchRoutes }
