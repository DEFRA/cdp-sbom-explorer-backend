import { sourceFromPath } from './source-from-path.js'

describe('sourceFromUrl', () => {
  test('it correctly parses a normal path', () => {
    const result = sourceFromPath(
      'cdp-user-service-backend/0.277.0/sbom.json.gz'
    )
    expect(result).toEqual({
      name: 'cdp-user-service-backend',
      version: '0.277.0',
      stage: 'run'
    })
  })

  test('it correctly parses a custom stage path path', () => {
    const result = sourceFromPath(
      'cdp-user-service-backend/0.277.0/sbom.development.json.gz'
    )
    expect(result).toEqual({
      name: 'cdp-user-service-backend',
      version: '0.277.0',
      stage: 'development'
    })
  })

  describe('it should fail on invalid paths', () => {
    test('missing version', () => {
      expect(() => sourceFromPath('foo/sbom.json.gz')).toThrowError()
    })

    test('missing name', () => {
      expect(() => sourceFromPath('0.277.0/sbom.json.gz')).toThrowError()
    })

    test('invalid name', () => {
      expect(() =>
        sourceFromPath('foo/0.277.0/cyclonedx.json.gz')
      ).toThrowError()
    })

    test('invalid extension', () => {
      expect(() => sourceFromPath('foo/0.277.0/sbom.json')).toThrowError()
    })

    test('extra path segments', () => {
      expect(() =>
        sourceFromPath('foo/0.277.0/sbom.json.gz/extra')
      ).toThrowError()
    })
  })
})
