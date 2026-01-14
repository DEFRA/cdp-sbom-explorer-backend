/**
 * Inserts a new entity record, returning the id field.
 * @param { import('pg-pool').Pool } pg
 * @param {string} name
 * @param {string} version
 * @param {string} stage
 * @return {Promise<BigInt>}
 */
export async function upsertEntity(pg, name, version, stage) {
  const upsertSql = `INSERT INTO entities (name, version, stage)
                     VALUES ($1, $2, $3)
                     ON CONFLICT (name, version, stage)
                       DO UPDATE SET
                         id = entities.id
                     RETURNING id`
  const result = await pg.query(upsertSql, [name, version, stage])
  return BigInt(result.rows[0]?.id)
}
