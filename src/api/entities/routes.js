import dependenciesController from './controllers/dependencies.js'

export default [
  {
    method: 'GET',
    path: '/entities/{name}/dependencies',
    ...dependenciesController
  }
]
