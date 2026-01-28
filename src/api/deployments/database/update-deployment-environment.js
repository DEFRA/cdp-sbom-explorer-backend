/**
 * Updates the list 'latest' sbom imports (this assumes the SBOM
 * @param pg
 * @param logger
 * @param {string} environment
 * @param { {name: string, version: string}[]} deployments
 * @return {Promise<{inserted: *}>}
 */
async function updateDeploymentEnvironment(
  { pg, logger },
  environment,
  deployments
) {
  if (deployments.length === 0) {
    logger.warn('No dependencies found for entity')
    return { inserted: 0 }
  }

  const params = []
  const valuePlaceholders = deployments
    .map((row, i) => {
      const offset = i * 3
      params.push(environment, row.name, row.version)
      return `($${offset + 1}, $${offset + 2}, $${offset + 3})`
    })
    .join(',')

  const client = await pg.connect()
  try {
    await client.query('BEGIN')

    // Clear the current environment
    await client.query(`DELETE FROM deployments WHERE environment = $1`, [
      environment
    ])

    // Replace it with the new data
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

export { updateDeploymentEnvironment }
