import Joi from 'joi'

// Provide a JOI schema for each of the SBOM formats we support
// initially this will just be cyclone-dx-json, but we can expand this in the future should we want

const cycloneDxJsonSchema = Joi.object({
  bomFormat: Joi.string().valid('CycloneDX').required(),
  components: Joi.array().items(
    Joi.object({
      type: Joi.string().required(),
      name: Joi.string().required(),
      version: Joi.string().default('unknown')
    }).unknown(true)
  )
}).unknown(true)

export { cycloneDxJsonSchema }
