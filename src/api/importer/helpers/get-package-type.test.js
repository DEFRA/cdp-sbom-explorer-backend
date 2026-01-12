import { getPackageType } from './get-package-type.js'

describe('#getPackageType', () => {
  test('it uses the syft type field if present', () => {
    const component = {
      'bom-ref':
        'pkg:npm/%40smithy/config-resolver@4.4.3?package-id=45a9f4a3a9134675',
      type: 'library',
      author:
        'AWS SDK for JavaScript Team (https://aws.amazon.com/javascript/)',
      name: '@smithy/config-resolver',
      version: '4.4.3',
      licenses: [
        {
          license: {
            id: 'Apache-2.0'
          }
        }
      ],
      cpe: 'cpe:2.3:a:\\@smithy\\/config-resolver:\\@smithy\\/config-resolver:4.4.3:*:*:*:*:*:*:*',
      externalReferences: [],
      properties: [
        {
          name: 'syft:package:type',
          value: 'npm'
        }
      ]
    }

    expect(getPackageType(component)).toEqual('npm')
  })

  test('it uses the purl field the syft field is missing', () => {
    const component = {
      'bom-ref':
        'pkg:npm/%40smithy/config-resolver@4.4.3?package-id=45a9f4a3a9134675',
      type: 'library',
      author:
        'AWS SDK for JavaScript Team (https://aws.amazon.com/javascript/)',
      name: '@smithy/config-resolver',
      version: '4.4.3',
      licenses: [
        {
          license: {
            id: 'Apache-2.0'
          }
        }
      ],
      cpe: 'cpe:2.3:a:\\@smithy\\/config-resolver:\\@smithy\\/config-resolver:4.4.3:*:*:*:*:*:*:*',
      purl: 'pkg:npm/%40smithy/config-resolver@4.4.3',
      externalReferences: [],
      properties: []
    }
    expect(getPackageType(component)).toEqual('npm')
  })
})
