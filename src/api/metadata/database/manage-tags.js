/**
 * Inserts a new entity record, returning the id field.
 * @param { import('pg-pool').Pool } client
 * @param {{name, version, value}} update
 */
export async function updateTags(client, update) {
  const upsertSql = `
    INSERT INTO tags (entity_name, entity_version, value)
    VALUES ($1, $2, $3)
    ON CONFLICT (entity_name, value) DO UPDATE
      SET entity_version = EXCLUDED.entity_version`

  const result = await client.query(upsertSql, [
    update.name,
    update.version,
    update.value
  ])
  return Number(result.rowCount)
}

/**
 * @param { import('pg-pool').Pool } pg
 * @param { import('pino').Pino } logger
 * @param {{name, version, value}[]} tags - Array of { name, version, value }
 * @param {boolean} clearExisting
 * @return {Promise<Number>}
 */
export async function bulkUpdateTags(
  { pg, logger },
  tags,
  clearExisting = false
) {
  const names = tags.map((s) => s.name)
  const versions = tags.map((s) => s.version)
  const values = tags.map((s) => s.value)

  const query = `
    WITH input_data AS (
      SELECT * FROM UNNEST($1::text[], $2::text[], $3::text[])
                      AS t(entity_name, entity_version, value)
    )
    INSERT INTO tags (entity_name, entity_version, value)
    SELECT entity_name, entity_version, value FROM input_data
    ON CONFLICT (entity_name, value) DO UPDATE
      SET entity_version = EXCLUDED.entity_version
  `
  const client = await pg.connect()
  try {
    await client.query('BEGIN')

    if (clearExisting) {
      const distinctTags = [...new Set(values)]
      logger.info(`clearing tags: ${distinctTags.join(' ')}`)
      await client.query('DELETE FROM tags WHERE value = ANY($1::text[])', [
        distinctTags
      ])
    }

    const result = await client.query(query, [names, versions, values])
    await client.query('COMMIT')
    return Number(result.rowCount)
  } catch (e) {
    logger.error(e)
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
