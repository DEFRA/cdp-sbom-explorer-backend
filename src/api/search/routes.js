import { dependencySearchController } from './controllers/dependency-search-controller.js'

const searchRoutes = [
  {
    method: 'GET',
    path: '/search',
    ...dependencySearchController
  }
]

export { searchRoutes }
