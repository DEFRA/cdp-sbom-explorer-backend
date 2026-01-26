import { SQSClient } from '@aws-sdk/client-sqs'

let sqsClient = null

const sqs = {
  plugin: {
    name: 'sqs',
    version: '1.0.0',
    register: async function (server, options) {
      const clientConfig = {
        region: options.region
      }

      if (options.endpoint) {
        clientConfig.endpoint = options.endpoint
      }
      if (sqsClient === null) {
        sqsClient = new SQSClient(clientConfig)
      }
      server.decorate('server', 'sqsClient', sqsClient)
      server.decorate('request', 'sqsClient', sqsClient)
    }
  }
}

export { sqs, sqsClient }
