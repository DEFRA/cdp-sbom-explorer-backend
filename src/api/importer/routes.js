import { importController } from './controller/import-controller.js'

const importerRoutes = [
  {
    method: 'POST',
    path: '/import',
    ...importController
  }
]

export { importerRoutes }
