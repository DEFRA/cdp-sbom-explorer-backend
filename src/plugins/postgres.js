import Pool from 'pg-pool'
import { Signer } from '@aws-sdk/rds-signer'
import { fromNodeProviderChain } from '@aws-sdk/credential-providers'
import Joi from 'joi'

/**
 * Creates a function that takes a set of options and returns a function that provides a Postgres password.
 * If useIAM is set to true then it will attempt to get a token from the AWS RDS API.
 * If it's not set then it returns the value set in localPassword, allowing for local development.
 * @param {{ host: string, port: number, user: string, region: string, useIAM: boolean, localPassword: string|null }} options
 */
function createPasswordProvider(options) {
  if (!options.useIAM) {
    return () => options.localPassword
  }

  const credentials = fromNodeProviderChain()
  const signer = new Signer({
    hostname: options.host,
    port: options.port,
    username: options.user,
    credentials,
    region: options.region
  })

  return async () => signer.getAuthToken()
}

/**
 * Ensures the connection pool has at least one active connection.
 * @param pool
 * @param count
 * @return {Promise<void>}
 */
async function preWarm(pool, count) {
  const clients = await Promise.all(
    Array.from({ length: count }, async () => {
      const client = await pool.connect()
      try {
        await client.query('SELECT 1')
        return client
      } catch (err) {
        client.release(true)
        throw err
      }
    })
  )

  clients.forEach((client) => client.release())
}

/**
 * Keep at least one connection active
 * @param pool
 * @param intervalMs
 * @param logger
 * @return {number|null}
 */
function startKeepWarm(pool, intervalMs, logger) {
  if (!intervalMs) return null

  return setInterval(async () => {
    try {
      await pool.query('SELECT 1')
    } catch (err) {
      logger?.error(err)
    }
  }, intervalMs)
}

export const postgres = {
  plugin: {
    name: 'postgres',
    version: '0.0.0',
    /**
     *
     * @param { import('@hapi/hapi').Server } server
     * @param {{ host: string, port: number, user: string, database: string, region: string, useIAM: boolean, localPassword: string|null, ssl: boolean|null }} options
     */
    register: async function (server, options) {
      const { value, error } = optionsSchema.validate(options)
      if (error) {
        throw new Error(error)
      }
      const passwordProvider = createPasswordProvider(value)

      const poolConfig = {
        user: value.user,
        password: passwordProvider,
        host: value.host,
        port: value.port,
        database: value.database,
        connectionTimeoutMillis: value.pool.connectionTimeoutMillis,
        max: value.pool.max,
        min: value.pool.min,
        ssl: value.ssl,
        ...(value.pool ?? {})
      }

      const pool = new Pool(poolConfig)
      pool.on('error', (err) => {
        server.logger.error(err)
      })

      // Test the connection
      await preWarm(pool, poolConfig.min)

      const keepWarmTimer = startKeepWarm(pool, 60 * 1000, server.logger)

      server.decorate('server', 'pg', pool)
      server.decorate('request', 'pg', pool)

      server.events.on('stop', async () => {
        if (keepWarmTimer) {
          clearInterval(keepWarmTimer)
        }
        await pool.end()
      })
    }
  }
}

const optionsSchema = Joi.object({
  user: Joi.string().required().description('postgres username'),
  host: Joi.string().required().description('hostname of the RDS instance'),
  port: Joi.number().required().description('port of the RDS instance'),
  database: Joi.string().required().description('database to connect to'),
  useIAM: Joi.boolean()
    .required()
    .description('Authenticate with the database using IAM credentials'),
  localPassword: Joi.string()
    .min(0)
    .empty(true)
    .when('useIAM', {
      is: false,
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .description('Static password used when useIAM is set to false'),
  region: Joi.string()
    .when('useIAM', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .description('AWS region'),
  ssl: Joi.boolean().optional(),
  pool: Joi.object({
    connectionTimeoutMillis: Joi.number().optional(),
    max: Joi.number().optional(),
    min: Joi.number().optional(),
    allowExitOnIdle: Joi.boolean().optional()
  })
    .optional()
    .unknown(true)
    .description('override postgres pool settings'),
  tableStatsPoller: Joi.object({
    interval: Joi.number()
  }).optional()
})
