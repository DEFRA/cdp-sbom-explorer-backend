import { dependencyFilterController } from './dependency-filter-controller.js'

describe('dependencyFilterController query validation', () => {
  const schema = dependencyFilterController.options.validate.query

  test('allows empty query', () => {
    const { error } = schema.validate({})
    expect(error).toBeUndefined()
  })

  test('rejects empty strings', () => {
    const { error } = schema.validate({ name: '' })
    expect(error).toBeTruthy()
  })

  test('rejects whitespace-only strings', () => {
    const { error } = schema.validate({ partialName: '   ' })
    expect(error).toBeTruthy()
  })
})
