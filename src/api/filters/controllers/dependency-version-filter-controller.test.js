import { dependencyVersionFilterController } from './dependency-version-filter-controller.js'

describe('dependencyVersionFilterController params validation', () => {
  const schema = dependencyVersionFilterController.options.validate.params

  test('allows non-empty name and type', () => {
    const { error } = schema.validate({ type: 'npm', name: 'pino' })
    expect(error).toBeUndefined()
  })

  test('rejects empty name', () => {
    const { error } = schema.validate({ type: 'npm', name: '' })
    expect(error).toBeTruthy()
  })

  test('rejects missing type', () => {
    const { error } = schema.validate({ name: 'pino' })
    expect(error).toBeTruthy()
  })
})
