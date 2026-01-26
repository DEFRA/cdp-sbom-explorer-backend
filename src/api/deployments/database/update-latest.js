async function updateLatest({ pg, logger }) {
  const client = await pg.connect()
  try {
    await client.query('BEGIN')
    // delete current data, except for latest versions
    await client.query(
      `DELETE FROM deployments WHERE environment = 'latest'`,
      []
    )

    const sql = `
      INSERT INTO deployments (name, version, environment)
      SELECT DISTINCT ON (name)
          name,
          version,
          'latest' AS environment
      FROM entities
      ORDER BY name, created_at DESC`

    const result = await client.query(sql, [])
    await client.query('COMMIT')
    return { inserted: result.rowCount }
  } catch (e) {
    logger.error(e)
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

export { updateLatest }
