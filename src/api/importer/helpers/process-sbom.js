import { cycloneDxJsonSchema } from '../schemas/sbom-schemas.js'
import { upsertEntity } from '../database/upsert-entity.js'
import { persistDependencies } from '../database/persist-dependencies.js'
import { getPackageType } from './get-package-type.js'
import { semverToBigint } from './semver-to-bigint.js'
import { findEntityId } from '../database/find-entity-id.js'
import { removeEntity } from '../database/remove-entity.js'

const componentTypesToIgnore = new Set(['file'])

/**
 *
 * @param pg
 * @param {{name: string, version: string, stage: string}} source
 * @param rawSBOM
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
  if (existingEntityId && options.reprocess) {
    await removeEntity(pg, existingEntityId)
  }

  // TODO: update query to search by stage as well
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

export { processSbom }
