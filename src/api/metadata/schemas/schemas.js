import Joi from 'joi'

const entityVersion = Joi.object({
  name: Joi.string().required(),
  version: Joi.string().required()
})

export const schemas = Joi.object({
  environment: Joi.string().required(),
  versions: Joi.array().items(entityVersion).required()
})

export const teamUpdateSchema = Joi.object({
  name: Joi.string().required(),
  teams: Joi.array().items(Joi.string()).required()
})

export const teamsUpdateSchema = Joi.array().items(teamUpdateSchema)
