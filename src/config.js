import convict from 'convict'
import convictFormatWithValidator from 'convict-format-with-validator'

convict.addFormats(convictFormatWithValidator)

const isProduction = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'

const config = convict({
  serviceVersion: {
    doc: 'The service version, this variable is injected into your docker container in CDP environments',
    format: String,
    nullable: true,
    default: null,
    env: 'SERVICE_VERSION'
  },
  host: {
    doc: 'The IP address to bind',
    format: 'ipaddress',
    default: '0.0.0.0',
    env: 'HOST'
  },
  port: {
    doc: 'The port to bind',
    format: 'port',
    default: 3003,
    env: 'PORT'
  },
  serviceName: {
    doc: 'Api Service Name',
    format: String,
    default: 'cdp-sbom-explorer-backend'
  },
  cdpEnvironment: {
    doc: 'The CDP environment the app is running in. With the addition of "local" for local development',
    format: [
      'local',
      'infra-dev',
      'management',
      'dev',
      'test',
      'perf-test',
      'ext-test',
      'prod'
    ],
    default: 'local',
    env: 'ENVIRONMENT'
  },
  aws: {
    region: {
      doc: 'AWS region',
      format: String,
      default: 'eu-west-2',
      env: 'AWS_REGION'
    },
    s3: {
      endpoint: {
        doc: 'AWS S3 endpoint',
        format: String,
        default: null,
        nullable: true,
        env: 'S3_ENDPOINT'
      },
      forcePathStyle: {
        doc: 'AWS S3 forcePathStyle option',
        format: Boolean,
        default: !isProduction
      }
    }
  },
  sbomBucket: {
    doc: 'name of the SBOM S3 bucket',
    format: String,
    default: 'cdp-management-sbom',
    nullable: true,
    env: 'S3_SBOM_BUCKET'
  },
  postgres: {
    host: {
      doc: 'host for postgres',
      format: String,
      default: 'localhost',
      env: 'DB_HOST'
    },
    port: {
      doc: 'port for postgres',
      format: Number,
      default: 5432,
      env: 'DB_PORT'
    },
    database: {
      doc: 'database for postgres',
      format: String,
      default: 'cdp_sbom_explorer_backend',
      env: 'DB_DATABASE'
    },
    user: {
      doc: 'user for postgres',
      format: String,
      default: 'postgres',
      env: 'DB_USER'
    },
    ssl: {
      doc: 'connect using SSL',
      format: Boolean,
      default: isProduction,
      env: 'DB_SSL'
    },
    useIAM: {
      doc: 'enable iam authentication for postgres',
      format: Boolean,
      default: isProduction,
      env: 'DB_IAM_AUTHENTICATION'
    },
    localPassword: {
      doc: 'password for local development. used when iamAuthentication is not enabled',
      format: String,
      default: 'password',
      env: 'DB_LOCAL_PASSWORD'
    },
    region: {
      doc: 'AWS region',
      format: String,
      default: 'eu-west-2',
      env: 'AWS_REGION'
    }
  },
  log: {
    isEnabled: {
      doc: 'Is logging enabled',
      format: Boolean,
      default: !isTest,
      env: 'LOG_ENABLED'
    },
    level: {
      doc: 'Logging level',
      format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
      default: 'info',
      env: 'LOG_LEVEL'
    },
    format: {
      doc: 'Format to output logs in',
      format: ['ecs', 'pino-pretty'],
      default: isProduction ? 'ecs' : 'pino-pretty',
      env: 'LOG_FORMAT'
    },
    redact: {
      doc: 'Log paths to redact',
      format: Array,
      default: isProduction
        ? ['req.headers.authorization', 'req.headers.cookie', 'res.headers']
        : ['req', 'res', 'responseTime']
    }
  },
  httpProxy: {
    doc: 'HTTP Proxy URL',
    format: String,
    nullable: true,
    default: null,
    env: 'HTTP_PROXY'
  },
  isMetricsEnabled: {
    doc: 'Enable metrics reporting',
    format: Boolean,
    default: isProduction,
    env: 'ENABLE_METRICS'
  },
  tracing: {
    header: {
      doc: 'CDP tracing header name',
      format: String,
      default: 'x-cdp-request-id',
      env: 'TRACING_HEADER'
    }
  }
})

config.validate({ allowed: 'strict' })

export { config }
