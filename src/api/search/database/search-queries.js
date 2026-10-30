const whereDepName = (idx) => `d.name = $${idx}`
const whereDepVersion = (idx) => `d.version = $${idx}`
const whereDepVersionGte = (idx) => `d.version_num >= $${idx}`
const whereDepVersionLte = (idx) => `d.version_num <= $${idx}`
const whereType = (idx) => `d.type = $${idx}`
const whereStage = (idx) => `e.stage = $${idx}`

const whereTeam = (idx) =>
  `EXISTS (SELECT 1 FROM labels l WHERE l.entity_name = e.name AND l.key = 'team' AND l.value = $${idx})`
const whereTag = (idx) =>
  `EXISTS (SELECT 1 FROM tags t WHERE t.entity_name = e.name AND t.entity_version = e.version AND t.value = $${idx})`

const whereClauses = {
  name: whereDepName,
  version: whereDepVersion,
  gte: whereDepVersionGte,
  lte: whereDepVersionLte,
  environment: whereTag, // Environment is just a tag
  tag: whereTag,
  type: whereType,
  stage: whereStage,
  team: whereTeam
}

/**
 * A basic WHERE clause builder to support dynamic queries.
 * @param {Object} query
 * @param {Number|null} limit
 * @return {{sql: string, values: *[]}|undefined}
 */
export function buildSearchQuery(query) {
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

  const selectFields = [
    'e.name',
    'e.version',
    'e.stage',
    'd.version as depversion',
    'd.type as deptype',
    "array_remove(array_agg(DISTINCT concat(labels.key::TEXT, ':', labels.value::TEXT)), NULL) AS labels",
    'array_remove(array_agg(DISTINCT tg.value::TEXT), NULL) AS tags'
  ]

  const select = `SELECT ${selectFields.join(', ')} FROM entity_dependencies as ed`
  const joins = [
    'JOIN entities as e ON e.id = ed.entity_id',
    'JOIN dependencies as d ON d.id = ed.dependency_id',
    'LEFT JOIN labels AS labels ON labels.entity_name = e.name',
    'LEFT JOIN tags AS tg ON tg.entity_name = e.name AND tg.entity_version = e.version'
  ]

  const limit = query.limit
  const limitSql = limit ? ` LIMIT ${limit}` : ''
  const sql = `${select} ${joins.join(' ')} WHERE ${where.join(' AND ')} ORDER BY d.version_num DESC, e.name ASC${limitSql}`
  return { sql, values }
}

/**
 *
 * @param { import('pg-pool').Pool } pg
 * @param {{name: string?, version: string?, lte: string?, gte: string?, environment: string?, team:string? }} query
 * @return {Promise<{name: string, version: string, stage: string}[]>}
 */
async function searchDependencies(pg, query) {
  const { sql, values } = buildSearchQuery(query, 1000) // TODO: hardcoded limit for now, we should probably paginate
  if (!sql || !values) {
    throw new Error(
      `Invalid query [${Object.keys(query).join(', ')}] can only use [${Object.keys(whereClauses).join(', ')}] `
    )
  }

  const result = await pg.query(sql, values)
  return result.rows
}

export { searchDependencies }
