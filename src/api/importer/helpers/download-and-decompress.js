import { GetObjectCommand } from '@aws-sdk/client-s3'
import { createGunzip } from 'node:zlib'
import { finished } from 'node:stream/promises'

async function downloadAndDecompress(s3, bucket, key) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key })
  const { Body } = await s3.send(command)

  if (!Body || typeof Body.pipe !== 'function') {
    throw new Error(
      `S3 object body is not a readable stream for s3://${bucket}/${key}`
    )
  }

  const gunzip = createGunzip()
  const chunks = []

  Body.pipe(gunzip)
  gunzip.on('data', (chunk) => chunks.push(chunk))

  await finished(gunzip)

  return Buffer.concat(chunks).toString('utf-8')
}

export { downloadAndDecompress }
