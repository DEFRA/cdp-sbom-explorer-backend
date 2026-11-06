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


export async function updateDependencyVersions(pg, logger, dependencies = []) {

  const updates = dependencies.map(
    ({ id, versionNum }) => `(${id},${versionNum})`
  ).join(',\n')

  const sql = `UPDATE dependencies
    SET version_num = update.version_num
    FROM (VALUES
      ${updates}
    ) as update(id, version_num)
    WHERE dependencies.id = update.id`

  const result = await pg.query(sql)
  logger.info(`Washed ${result.rowCount} dependencies`)
}
