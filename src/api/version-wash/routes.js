import washController from './controllers/version-wash.js'

export default [
  {
    method: 'POST',
    path: '/version-wash',
    ...washController
  }
]
