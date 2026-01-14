import { createLogger } from '../../../common/helpers/logging/logger.js'

const logger = createLogger()
/**
 * Upserts any dependency objects and links them to an entity.
 * Uses `unnest` for performance/bulk inserting.
 * @param { import('pg-pool').Pool } pg
 * @param {number|BigInt} entityId
 * @param {{type: string, name: string, version: string, versionNum: BigInt}[]} deps
 * @returns {Promise<{inserted: number}>}
 */
export async function persistDependencies(pg, entityId, deps) {
  if (deps.length === 0) {
    logger.warn('No dependencies found for entity')
    return { inserted: 0 }
  }

  try {
    const params = [
      deps.map((d) => d.type),
      deps.map((d) => d.name),
      deps.map((d) => d.version),
      deps.map((d) => d.versionNum),
      entityId
    ]

    await pg.query('BEGIN')

    const insertSql = `
    WITH input_deps AS (
      SELECT *
      FROM unnest(
        $1::text[],   -- type[]
        $2::text[],   -- name[]
        $3::text[],   -- version[]
        $4::bigint[]  -- version_num[]
      ) AS t(type, name, version, version_num)
    ),
    deduped AS (
      SELECT DISTINCT ON (type, name, version)
             type, name, version, version_num
      FROM input_deps
      ORDER BY type, name, version
    ),
    upserted AS (
      INSERT INTO dependencies (type, name, version, version_num)
      SELECT type, name, version, version_num
      FROM deduped
      ON CONFLICT (type, name, version)
      DO UPDATE SET
        id = dependencies.id
      RETURNING id
    )
    INSERT INTO entity_dependencies (entity_id, dependency_id)
    SELECT $5::bigint, id
    FROM upserted
    ON CONFLICT DO NOTHING`
    const insertResult = await pg.query(insertSql, params)
    await pg.query('COMMIT')
    return { inserted: insertResult.rowCount }
  } catch (e) {
    logger.error(e)
    await pg.query('ROLLBACK')
    throw e
  }
}
