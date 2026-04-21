/**
 * Returns the ID of an entity, if it exists
 * @param { import('pg-pool').Pool } pg
 * @param {string} name
 * @param {string} version
 * @param {string} stage
 * @param {import('@defra/cdp-metrics').Metrics} metrics
 * @returns {Promise<Number|BigInt>}
 */

export async function findEntityId(pg, name, version, stage, metrics) {
  const result = await metrics.timer('FindEntityIdDBLatencyMs', () => {
    const findSql = `SELECT id from entities WHERE name = $1 AND version = $2 and stage = $3 LIMIT 1`
    return pg.query(findSql, [name, version, stage])
  })
  return Number(result.rows[0]?.id)
}
