import { sourceFromPath } from '../helpers/source-from-path.js'
import { downloadAndDecompress } from '../helpers/download-and-decompress.js'
import { processSbom } from '../helpers/process-sbom.js'
import { config } from '../../../config.js'
import Joi from 'joi'

const importController = {
  options: {
    validate: {
      query: Joi.object({ key: Joi.string().required() })
    }
  },
  handler: async (request, h) => {
    const bucket = config.get('sbomBucket')
    const key = request.query.key

    request.logger.info(`importing s3://${bucket}/${key}`)

    const source = sourceFromPath(key)
    const raw = await downloadAndDecompress(request.s3Client, bucket, key)
    const result = await processSbom(request.pg, source, raw, {})

    request.logger.info(
      `Imported: ${result.inserted} dependencies for ${source.name}:${source.version}@${source.stage}`
    )
    return h.response(result).code(200)
  }
}

export { importController }
