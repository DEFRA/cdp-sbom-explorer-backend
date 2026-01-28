import Joi from 'joi'

const entityVersion = Joi.object({
  name: Joi.string().required(),
  version: Joi.string().required()
})

const deploymentsForEnvSchema = Joi.object({
  environment: Joi.string().required(),
  versions: Joi.array().items(entityVersion).required()
})

export { deploymentsForEnvSchema }
