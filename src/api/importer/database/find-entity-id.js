/**
 * Returns the ID of an entity, if it exists
 * @param { import('pg-pool').Pool } pg
 * @param {string} name
 * @param {string} version
 * @param {string} stage
 * @returns {Promise<number|null>}
 */

export async function findEntityId(pg, name, version, stage) {
  const findSql = `SELECT ID from entities WHERE name = $1 AND version = $2 and stage = $3 LIMIT 1`
  const result = await pg.query(findSql, [name, version, stage])
  return result.rows[0]?.id
}
