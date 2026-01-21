import { Consumer } from 'sqs-consumer'
import { bucketEventHandler } from '../api/importer/listener/bucket-event-handler.js'

const sbomBucketListener = {
  plugin: {
    name: 'sqsListener',
    version: '0.1.0',
    dependencies: ['sqs'],
    register: (server, options) => {
      if (!options.enabled) {
        server.logger.info('SBOM Bucket change listener is DISABLED')
        return
      }

      if (!server.sqsClient) {
        throw new Error(
          'server.sqsClient does not exist, check sqs plugin has been loaded'
        )
      }

      const queueUrl = options.queueUrl
      server.logger.info(
        `Bucket change listener is listening for events on ${queueUrl}`
      )

      const consumer = Consumer.create({
        sqs: server.sqsClient,
        queueUrl,
        //useQueueUrlAsEndpoint: true,
        attributeNames: ['SentTimestamp'],
        messageAttributeNames: ['All'],
        waitTimeSeconds: options.waitTimeSeconds,
        pollingWaitTimeMs: options.pollingWaitTimeMs,
        visibilityTimeout: options.visibilityTimeout,
        handleMessage: (message) => bucketEventHandler(server, message)
      })

      consumer.on('error', (error) => {
        server.logger.error(`Error ${queueUrl} : ${error.message}`)
      })

      consumer.on('processing_error', (error) => {
        server.logger.error(`Processing error ${queueUrl} : ${error.message}`)
      })

      consumer.on('timeout_error', (error) => {
        server.logger.error(`Timeout error ${queueUrl} : ${error.message}`)
      })

      server.events.on('stop', () => {
        server.logger.info(`Closing SQS Listener for ${queueUrl}`)
        consumer.stop()
      })

      consumer.start()
    }
  }
}

export { sbomBucketListener }
