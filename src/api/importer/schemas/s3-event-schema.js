import Joi from 'joi'

const supportedEventTypes = Joi.string().valid(
  'ObjectCreated:Put',
  'ObjectCreated:Post',
  'ObjectCreated:Copy',
  'ObjectCreated:CompleteMultipartUpload'
)

const s3EventSchema = Joi.object({
  eventName: supportedEventTypes,
  s3: Joi.object({
    bucket: Joi.object({
      name: Joi.string().required()
    }).unknown(true),
    object: Joi.object({
      key: Joi.string().required()
    }).unknown(true)
  }).unknown(true)
}).unknown(true)

const s3EventBodySchema = Joi.object({
  Records: Joi.array().items(s3EventSchema)
})

export { s3EventBodySchema }
