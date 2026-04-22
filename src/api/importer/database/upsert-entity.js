/**
 * Inserts a new entity record, returning the id field.
 * @param { import('pg-pool').Pool } pg
 * @param {string} name
 * @param {string} version
 * @param {string} stage
 * @param {import('@defra/cdp-metrics').Metrics} metrics
 * @return {Promise<Number>}
 */
export async function upsertEntity(pg, name, version, stage, metrics) {
  const upsertSql = `INSERT INTO entities (name, version, stage)
                     VALUES ($1, $2, $3)
                     ON CONFLICT (name, version, stage)
                       DO UPDATE SET
                         id = entities.id
                     RETURNING id`
  const result = await metrics.timer('UpsertEntityTypesDBLatencyMs', () =>
    pg.query(upsertSql, [name, version, stage])
  )
  return Number(result.rows[0]?.id)
}
