import { importController } from './controller/import-controller.js'
import { startBackfillController } from './controller/start-backfill-controller.js'

const importerRoutes = [
  {
    method: 'POST',
    path: '/import',
    ...importController
  },
  {
    method: 'POST',
    path: '/backfill',
    ...startBackfillController
  }
]

export { importerRoutes }
