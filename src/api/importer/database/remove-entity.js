/**
 * Removes a specific entity by id and any dependencies associated with it
 * @param { import('pg-pool').Pool } pg
 * @param {number|BigInt} entityId
 * @return {Promise<void>}
 */
async function removeEntity(pg, entityId) {
  await pg.query('BEGIN')
  try {
    await pg.query('DELETE FROM entity_dependencies WHERE entity_id = $1', [
      entityId
    ])
    await pg.query('DELETE FROM entities WHERE id = $1', [entityId])
    await pg.query('COMMIT')
  } catch (err) {
    await pg.query('ROLLBACK')
    throw err
  }
}

export { removeEntity }
