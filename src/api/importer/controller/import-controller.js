import { importSbom } from '../helpers/import-sbom.js'
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

    const result = await importSbom(request, bucket, key)
    return h.response(result).code(200)
  }
}

export { importController }
