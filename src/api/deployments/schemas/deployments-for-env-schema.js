import Joi from 'joi'

const deploymentSchema = Joi.object({
  name: Joi.string().required(),
  version: Joi.string().required()
})

const deploymentsForEnvSchema = Joi.object({
  environment: Joi.string().required(),
  deployments: Joi.array().items(deploymentSchema).required()
})

export { deploymentsForEnvSchema }
