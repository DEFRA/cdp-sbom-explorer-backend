async function updateDeployments({ pg, logger }, deployments) {
  if (deployments.length === 0) {
    logger.warn('No dependencies found for entity')
    return { inserted: 0 }
  }

  const params = []
  const valuePlaceholders = deployments
    .map((row, i) => {
      const offset = i * 3
      params.push(row.environment, row.service, row.version)
      return `($${offset + 1}, $${offset + 2}, $${offset + 3})`
    })
    .join(',')

  const client = await pg.connect()
  try {
    await client.query('BEGIN')
    // delete current data, except for latest versions
    await client.query(
      `DELETE FROM deployments WHERE environment <> 'latest'`,
      []
    )
    const insertSql = `INSERT INTO deployments (environment, name, version) VALUES ${valuePlaceholders}`
    const insertResult = await client.query(insertSql, params)
    await client.query('COMMIT')
    return { inserted: insertResult.rowCount }
  } catch (e) {
    logger.error(e)
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

export { updateDeployments }
