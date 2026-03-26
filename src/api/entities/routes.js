import dependenciesController from './controllers/dependencies.js'

export default [
  {
    method: 'GET',
    path: '/entities/{entityName}/dependencies',
    ...dependenciesController
  }
]
