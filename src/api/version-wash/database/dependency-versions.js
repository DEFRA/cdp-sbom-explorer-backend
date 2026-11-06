export async function* listDependencyVersions(pg, logger, startOffset = 0) {
  const limit = 10000;
  let offset = startOffset
  let rowCount = 0

  const sql = `SELECT id, version
    FROM dependencies
    LIMIT ${limit}
    OFFSET $1`

  do {
    logger.info(`Fetching wash dependencies at offset ${offset}`)
    const result = await pg.query(sql, [offset])
    rowCount = result.rowCount

    yield result.rows

    offset = offset + limit
  } while (rowCount === limit)
}
