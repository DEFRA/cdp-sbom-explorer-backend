/**
 * @param { import('pg-pool').Pool } client
 * @param {string} labelKey - Which key to set
 * @param {{name, value}[]} labels - Array of { name, version, key, value }
 * @param {import('@defra/cdp-metrics').Metrics} metrics
 * @param {boolean} clearExisting - Deletes all existing keys that match
 * @return {Promise<Number>}
 */
export async function bulkUpdateLabels(
  { pg, logger },
  labelKey,
  labels,
  metrics,
  clearExisting = false
) {
  const names = labels.map((s) => s.name)
  const values = labels.map((s) => s.value)

  const query = `
    WITH input_data AS (
      SELECT * FROM UNNEST($1::text[], $2::text[])
                      AS l(entity_name, value)
    )
    INSERT INTO labels (entity_name, key, value)
    SELECT entity_name, $3, value FROM input_data
    ON CONFLICT (entity_name, key, value) DO NOTHING
    `

  return metrics.timer('BulkUpdateLabelsDBLatencyMs', async () => {
    const client = await pg.connect()

    try {
      await client.query('BEGIN')

      if (clearExisting) {
        logger.info(`clearing label: ${labelKey}`)
        await client.query('DELETE FROM labels WHERE key = $1', [labelKey])
      }

      const result = await client.query(query, [names, values, labelKey])
      logger.info(`updated ${result.rowCount} ${labelKey} labels`)
      await client.query('COMMIT')
      return Number(result.rowCount)
    } catch (e) {
      logger.error(e)
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
  })
}
