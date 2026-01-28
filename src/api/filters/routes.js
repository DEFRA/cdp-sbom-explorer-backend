import { dependencyFilterController } from './controllers/dependency-filter-controller.js'
import { entityStageFilterController } from './controllers/entity-stage-filter-controller.js'
import { dependencyVersionFilterController } from './controllers/dependency-version-filter-controller.js'
import { dependencyTypeFilterController } from './controllers/dependency-type-filter.js'

const filterRoutes = [
  {
    method: 'GET',
    path: '/filters/dependencies',
    ...dependencyFilterController
  },
  {
    method: 'GET',
    path: '/filters/dependency-type',
    ...dependencyTypeFilterController
  },
  {
    method: 'GET',
    path: '/filters/dependencies/{type}/{name}',
    ...dependencyVersionFilterController
  },
  {
    method: 'GET',
    path: '/filters/entity-stage',
    ...entityStageFilterController
  }
]

export { filterRoutes }
