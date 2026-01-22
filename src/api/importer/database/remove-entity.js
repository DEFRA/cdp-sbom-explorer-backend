/**
 * Removes a specific entity by id and any dependencies associated with it
 * @param { import('pg-pool').Pool } pg
 * @param {number|BigInt} entityId
 * @return {Promise<void>}
 */
async function removeEntity(pg, entityId) {
  const client = await pg.connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM entity_dependencies WHERE entity_id = $1', [
      entityId
    ])
    await client.query('DELETE FROM entities WHERE id = $1', [entityId])
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export { removeEntity }
