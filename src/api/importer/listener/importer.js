import { downloadAndDecompress } from '../helpers/download-and-decompress.js'
import { sourceFromPath } from '../helpers/source-from-path.js'
import { processSbom } from '../helpers/process-sbom.js'

export async function importSBOM(server, bucket, key, options = {}) {
  const source = sourceFromPath(key)
  const raw = await downloadAndDecompress(server.s3Client, bucket, key)

  const result = await processSbom(server.pg, source, raw, options)

  server.logger.info(
    `Imported: ${result.inserted} dependencies for ${source.name}:${source.version}@${source.stage}`
  )
}
