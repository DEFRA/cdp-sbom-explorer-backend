import { cycloneDxJsonSchema } from '../schemas/sbom-schemas.js'
import { upsertEntity } from '../database/upsert-entity.js'
import { persistDependencies } from '../database/persist-dependencies.js'
import { getPackageType } from './get-package-type.js'
import { semverToBigint } from './semver-to-bigint.js'
import { findEntityId } from '../database/find-entity-id.js'
import { removeEntity } from '../database/remove-entity.js'
import { sourceFromPath } from './source-from-path.js'
import { downloadAndDecompress } from './download-and-decompress.js'

const namesToIgnore = new Set([])
const versionsToIgnore = new Set(['latest'])

const componentTypesToIgnore = new Set(['file'])

/**
 *
 * @param pg
 * @param {{name: string, version: string, stage: string}} source
 * @param {string} bucket
 * @param {string} key
 * @param {{reprocess: boolean|null}} options
 * @returns {Promise<{inserted: number}>}
 */
async function importSbom({ pg, s3Client, logger }, bucket, key, options = {}) {
  const source = sourceFromPath(key)

  if (namesToIgnore.has(source.name)) {
    logger.info(`Skipping ${key}, name: ${source.name} is in the ignore list`)
    return { inserted: 0 }
  }

  if (versionsToIgnore.has(source.version)) {
    logger.info(
      `Skipping ${key}, version: ${source.version} is in the ignore list`
    )
    return { inserted: 0 }
  }

  const raw = await downloadAndDecompress(s3Client, bucket, key)
  return await processSbom(pg, source, raw, options)
}

/**
 *
 * @param pg
 * @param {{name: string, version: string, stage: string}} source
 * @param {string} rawSBOM
 * @param {{reprocess: boolean|null}} options
 * @returns {Promise<{inserted: number}>}
 */
async function processSbom(pg, source, rawSBOM, options = {}) {
  // parse json
  const sbomJson = JSON.parse(rawSBOM)

  // validate schema
  // currently we just support a single format (cyclone-dx json)
  const { error } = cycloneDxJsonSchema.validate(sbomJson)

  if (error) {
    throw Error(error.message)
  }

  const entityName = source.name
  const entityVersion = source.version
  const entityStage = source.stage

  // check if we've seen it before
  const existingEntityId = await findEntityId(
    pg,
    entityName,
    entityVersion,
    entityStage
  )
  if (existingEntityId) {
    if (options.reprocess) {
      await removeEntity(pg, existingEntityId)
    } else {
      return { inserted: 0 }
    }
  }

  const entityId = await upsertEntity(
    pg,
    entityName,
    entityVersion,
    entityStage
  )

  const deps = []

  sbomJson?.components
    .filter((c) => !componentTypesToIgnore.has(c.type))
    .forEach((c) => {
      const type = getPackageType(c)
      const { name, version } = c
      const versionNum = semverToBigint(version)
      deps.push({ type, name, version, versionNum })
    })

  return await persistDependencies(pg, entityId, deps)
}

export { importSbom, processSbom }
