import { S3Client } from '@aws-sdk/client-s3'

/**
 * @satisfies {import('@hapi/hapi').Plugin}
 */
const s3 = {
  plugin: {
    name: 's3',
    version: '1.0.0',
    register(server, options) {
      const clientConfig = {
        region: options.region,
        forcePathStyle: options.forcePathStyle
      }

      // Override endpoint if required
      if (options.endpoint) {
        clientConfig.endpoint = options.endpoint
      }

      const client = new S3Client(clientConfig)

      server.decorate('request', 's3Client', client)
      server.decorate('server', 's3Client', client)

      server.events.on('stop', () => {
        server.logger.info('Closing S3 client')
        client.destroy()
      })
    }
  }
}

export { s3 }
