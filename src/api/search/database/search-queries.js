const baseQuery = `SELECT e.name, e.version, e.stage FROM  entity_dependencies as ed
JOIN entities as e ON e.id = ed.entity_id
JOIN dependencies as d ON d.id = ed.dependency_id`

/**
 *
 * @param { import('pg-pool').Pool } pg
 * @param {string} name
 * @return {Promise<{name: string, version: string, stage: string}[]>}
 */
async function findByDependencyName(pg, name) {
  const sqlNameOnly = `${baseQuery} WHERE d.name = $1
  `
  const result = await pg.query(sqlNameOnly, [name])
  return result.rows
}

/**
 *
 * @param { import('pg-pool').Pool } pg
 * @param {string} name
 * @param {string} version
 * @return {Promise<{name: string, version: string, stage: string}[]>}
 */
async function findByDependencyNameVersion(pg, name, version) {
  const sqlNameVersion = `${baseQuery} WHERE d.name = $1 AND d.version = $2`
  const result = await pg.query(sqlNameVersion, [name, version])
  return result.rows
}

/**
 *
 * @param { import('pg-pool').Pool } pg
 * @param {string} name
 * @param {bigint} gte
 * @param {bigint} lte
 * @return {Promise<{name: string, version: string, stage: string}[]>}
 */
async function findByDependencyNameVersionRange(pg, name, gte, lte) {
  const sqlNameVersionRange = `${baseQuery} WHERE d.name = $1 AND (d.version_num >= $2 AND d.version_num <= $3)`
  const result = await pg.query(sqlNameVersionRange, [name, gte, lte])
  return result.rows
}

export {
  findByDependencyName,
  findByDependencyNameVersion,
  findByDependencyNameVersionRange
}
