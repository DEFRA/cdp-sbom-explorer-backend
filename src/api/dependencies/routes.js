import dependentsController from './controllers/dependents.js'

export default [
  {
    method: 'GET',
    path: '/dependencies/{type}/{name}/dependents',
    ...dependentsController
  }
]
