import { s3EventBodySchema } from './s3-event-schema.js'

describe('#s3-event-schema', () => {
  it('should validate S3 change events', () => {
    const messageBody =
      '{"Records": [{"eventVersion": "2.1", "eventSource": "aws:s3", "awsRegion": "eu-west-2", "eventTime": "2026-01-20T11:59:17.223Z", "eventName": "ObjectCreated:Put", "userIdentity": {"principalId": "AIDAJDPLRKLG7UEXAMPLE"}, "requestParameters": {"sourceIPAddress": "127.0.0.1"}, "responseElements": {"x-amz-request-id": "ebeb9160", "x-amz-id-2": "eftixk72aD6Ap51TnqcoF8eFidJG9Z/2"}, "s3": {"s3SchemaVersion": "1.0", "configurationId": "ec4f4749", "bucket": {"name": "cdp-management-sbom", "ownerIdentity": {"principalId": "A3NL1KOZZKExample"}, "arn": "arn:aws:s3:::cdp-management-sbom"}, "object": {"key": "foo/1.4.0/sbom.json.gz", "sequencer": "0055AED6DCD90281E5", "eTag": "ec9367bb47c99d6a5ee43d9e3450e057", "size": 141064}}}]}'

    const { value, error } = s3EventBodySchema.validate(JSON.parse(messageBody))

    expect(error).toBeUndefined()
    expect(value).toMatchObject({
      Records: [
        {
          eventName: 'ObjectCreated:Put',
          s3: {
            bucket: { name: 'cdp-management-sbom' },
            object: { key: 'foo/1.4.0/sbom.json.gz' }
          }
        }
      ]
    })
  })

  it('should reject non put events S3 change events', () => {
    const messageBody =
      '{"Records": [{"eventVersion": "2.1", "eventSource": "aws:s3", "awsRegion": "eu-west-2", "eventTime": "2026-01-20T11:59:17.223Z", "eventName": "ObjectRemoved:Delete", "userIdentity": {"principalId": "AIDAJDPLRKLG7UEXAMPLE"}, "requestParameters": {"sourceIPAddress": "127.0.0.1"}, "responseElements": {"x-amz-request-id": "ebeb9160", "x-amz-id-2": "eftixk72aD6Ap51TnqcoF8eFidJG9Z/2"}, "s3": {"s3SchemaVersion": "1.0", "configurationId": "ec4f4749", "bucket": {"name": "cdp-management-sbom", "ownerIdentity": {"principalId": "A3NL1KOZZKExample"}, "arn": "arn:aws:s3:::cdp-management-sbom"}, "object": {"key": "foo/1.4.0/sbom.json.gz", "sequencer": "0055AED6DCD90281E5", "eTag": "ec9367bb47c99d6a5ee43d9e3450e057", "size": 141064}}}]}'

    const { error } = s3EventBodySchema.validate(JSON.parse(messageBody))

    expect(error).toBeDefined()
  })
})
