import { importSbom } from '../helpers/import-sbom.js'
import { s3EventBodySchema } from '../schemas/s3-event-schema.js'

/**
 *
 * @param {{}} server
 * @param {{Body: string}} message
 * @return {Promise<{}>}
 */
async function bucketEventHandler(server, message) {
  server.logger.info(message)

  const payload = JSON.parse(message.Body)
  const { value, error } = s3EventBodySchema.validate(payload)
  if (error) {
    server.logger.warn(`Event was not in the expected format: ${error.message}`)
    return message
  }

  for (const record of value.Records) {
    const bucket = record.s3.bucket.name
    const key = record.s3.object.key
    try {
      const result = await importSbom(server, bucket, key)
      server.logger.info(
        `Imported SBOM ${key}, inserted ${result.inserted} records`
      )
    } catch (error) {
      server.logger.error(`Failed to import ${key}, ${error}`)
    }
  }

  return message
}

export { bucketEventHandler }
