import { SendMessageBatchCommand } from '@aws-sdk/client-sqs'

const maxBatch = 10

/**
 * Takes a list of objects in S3, batches them and pushes them onto the import queue.
 * @param sqs
 * @param queueName
 * @param {{ key: string, bucket: string }[]} workItems
 * @return {Promise<*>}
 */
async function pushWorkItemsToQueue(sqs, queueName, workItems) {
  const entries = workItems.map((item, index) => ({
    Id: `backfill-${index}`,
    MessageBody: generateS3Notification(item),
    DelaySeconds: 5, // Slight delay to allow the backfill to finish
    MessageAttributes: {}
  }))

  // Send items 10 at a time
  // While the payload supports multiple keys per message, sending them one at a time makes retries safer etc...
  for (let i = 0; i < entries.length; i += maxBatch) {
    const batch = entries.slice(i, i + maxBatch)
    if (batch.length > 0) {
      const command = new SendMessageBatchCommand({
        QueueUrl: queueName,
        Entries: batch
      })
      await sqs.send(command)
    }
  }
}

function generateS3Notification(item) {
  const payload = {
    Records: [
      {
        eventName: 'ObjectCreated:Put',
        s3: {
          bucket: {
            name: item.bucket
          },
          object: {
            key: item.key
          }
        }
      }
    ]
  }

  return JSON.stringify(payload)
}

export { pushWorkItemsToQueue }
