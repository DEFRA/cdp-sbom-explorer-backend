import { health } from '../routes/health.js'
import { filterRoutes } from '../api/filters/routes.js'
import { searchRoutes } from '../api/search/routes.js'
import { importerRoutes } from '../api/importer/routes.js'
import { metadataRoutes } from '../api/metadata/routes.js'
import dependenciesRoutes from '../api/dependencies/routes.js'
import entitiesRoutes from '../api/entities/routes.js'
import washRoutes from '../api/version-wash/routes.js'

const router = {
  plugin: {
    name: 'router',
    register: (server, _options) => {
      server.route([health])
      server.route(filterRoutes)
      server.route(searchRoutes)
      server.route(importerRoutes)
      server.route(metadataRoutes)
      server.route(dependenciesRoutes)
      server.route(entitiesRoutes)
      server.route(washRoutes)
    }
  }
}

export { router }
