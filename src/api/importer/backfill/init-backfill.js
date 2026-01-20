import { ListObjectsV2Command } from '@aws-sdk/client-s3'
import { config } from '../../../config.js'
import { sourceFromPath } from '../helpers/source-from-path.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { pushWorkItemsToQueue } from '../helpers/push-workitems-to-queue.js'

const logger = createLogger()

/**
 *
 * @param {{s3Client, sqs }} server
 * @param {string} bucket
 * @param {string} queue
 * @param {number} pageSize
 * @return {Promise<void>}
 */
async function addAllS3KeysToWorklist(server, bucket, queue, pageSize = 1000) {
  if (!bucket) throw new Error('bucket is required')
  if (!queue) throw new Error('queue is required')

  logger.info(`Starting backfill from bucket: ${bucket} to queue: ${queue}`)

  let continuationToken = null
  let isTruncated = true
  let keysSent = 0

  while (isTruncated) {
    const params = {
      Bucket: bucket,
      MaxKeys: pageSize
    }

    if (continuationToken) {
      params.ContinuationToken = continuationToken
    }

    const cmd = new ListObjectsV2Command(params)
    const res = await server.s3Client.send(cmd)

    const keys = []
    if (res.Contents) {
      for (let i = 0; i < res.Contents.length; i++) {
        const key = res.Contents[i].Key
        if (key) {
          try {
            // calls sourceFromPath to validate key is a file we're interested in
            sourceFromPath(key)
            keys.push({ key, bucket })
          } catch (e) {
            logger.error(e)
          }
        }
      }
    }

    await pushWorkItemsToQueue(server.sqs, queue, keys)
    keysSent += keys.length
    logger.info(`Total keys backfilled: ${keysSent}`)

    isTruncated = res.IsTruncated === true
    continuationToken = res.NextContinuationToken || null
  }

  logger.info(`Backfill complete: Triggered import of ${keysSent} keys`)
}

async function initBackfill(request) {
  const bucket = config.get('sbomBucket')
  const queue = config.get('sbomQueue.queueUrl')
  console.log(request.s3Client)
  console.log(request.sqs)
  await addAllS3KeysToWorklist(request, bucket, queue, 100)
}

export { initBackfill }
