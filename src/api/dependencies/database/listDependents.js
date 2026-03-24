const whereDepName = (idx) => `d.name = $${idx}`
const whereDepVersionGte = (idx) => `d.version_num >= $${idx}`
const whereDepVersionLte = (idx) => `d.version_num <= $${idx}`
const whereEnvironment = (idx) => `dpl.environment = $${idx}`
const whereType = (idx) => `d.type = $${idx}`

const whereClauses = {
  name: whereDepName,
  gte: whereDepVersionGte,
  lte: whereDepVersionLte,
  environment: whereEnvironment,
  type: whereType
}

/**
 *
 * @param { import('pg-pool').Pool } pg
 * @param {{name: string|null, type: string|null, lte: string|null, gte: string|null, environment: string|null }} query
 * @return {Promise<{name: string, version: string, stage: string}[]>}
 */
export async function listDependents(pg, query) {
  const { sql, values } = buildSearchQuery(query, 1000) // TODO: hardcoded limit for now, we should paginate
  if (!sql || !values) {
    throw new Error(
      `Invalid query [${Object.keys(query).join(', ')}] can only use [${Object.keys(whereClauses).join(', ')}] `
    )
  }

  const result = await pg.query(sql, values)
  return result.rows
}

/**
 * A basic WHERE clause builder to support dynamic queries.
 * @param {Object} query
 * @param {Number|null} limit
 * @return {{sql: string, values: *[]}|undefined}
 */
export function buildSearchQuery(query, limit = null) {
  // TODO: maybe use Joi to validate this instead?
  const keys = Object.keys(query).filter((q) => whereClauses[q])
  if (keys.length === 0) {
    return undefined
  }

  const where = []
  const values = []

  for (const key of keys) {
    if (!whereClauses[key]) {
      continue
    }
    where.push(whereClauses[key](where.length + 1))
    values.push(query[key])
  }

  const sql = `
    SELECT e.name, e.version, d.version as depversion, array_remove(array_agg(dpl.environment::TEXT), NULL) as environments
    FROM entity_dependencies as ed
    JOIN entities as e ON e.id = ed.entity_id
    JOIN dependencies as d ON d.id = ed.dependency_id
    LEFT JOIN deployments as dpl ON dpl.name = e.name AND dpl.version = e.version
    WHERE ${where.join(' AND ')}
    GROUP BY e.name, e.version, d.version
    ORDER BY e.name ASC, e.version DESC
    LIMIT ${limit}
  `

  return { sql, values }
}
