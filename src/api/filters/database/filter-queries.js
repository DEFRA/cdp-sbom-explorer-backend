import environmentTags from '../../../common/constants/environmentTags.js'

const whereName = (idx) => `d.name = $${idx}`
const whereType = (idx) => `d.type = $${idx}`
const wherePartialName = (idx) => `d.name LIKE $${idx}`

const whereClauses = {
  name: whereName,
  partialName: wherePartialName,
  type: whereType
}

/**
 * A basic WHERE clause builder to support dynamic queries.
 * @param {{ name: string, partialName: string, type: string }} query
 * @return {{sql: string, values: *[]}}
 */
function buildUniqueDependencyQuery(query) {
  const keys = Object.keys(query).filter((q) => whereClauses[q])
  const where = []
  const values = []

  for (const key of keys) {
    if (!whereClauses[key]) {
      continue
    }
    where.push(whereClauses[key](where.length + 1))
    values.push(query[key])
  }

  const selectSql = 'SELECT DISTINCT name, type FROM dependencies as d'
  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''
  const sql = `${selectSql} ${whereSql} ORDER BY name`
  return { sql, values }
}

/**
 * Returns a filterable list of unique dependencies.
 * @param pg
 * @param {{ name: string, partialName: string, type: string }} query
 * @param {import('@defra/cdp-metrics').Metrics} metrics
 * @return {Promise<*>}
 */
export async function uniqueDependencies(pg, query, metrics) {
  const { sql, values } = buildUniqueDependencyQuery(query)
  const result = await metrics.timer('UniqueDependenciesDBLatencyMs', () =>
    pg.query(sql, values)
  )
  metrics.counter('UniqueDependenciesRowsReturned', result.rows.length)
  return result.rows
}

/**
 * Returns a filterable list of unique dependencies.
 * @param pg
 * @param {import('@defra/cdp-metrics').Metrics} metrics
 * @return {Promise<*>}
 */
export async function uniqueDependencyTypes(pg, metrics) {
  const result = await metrics.timer('UniqueDependencyTypesDBLatencyMs', () =>
    pg.query('SELECT DISTINCT type FROM dependencies ORDER BY type')
  )

  return result.rows.map((row) => row.type)
}

/**
 * Returns all the distinct entity stages (e.g. run, build, development etc)
 * @param pg
 * @param {import('@defra/cdp-metrics').Metrics} metrics
 * @return {Promise<string[]>}
 */
export async function uniqueEntityStages(pg, metrics) {
  const result = await metrics.timer('UniqueEntityStagesDBLatencyMs', () =>
    pg.query('SELECT DISTINCT stage FROM entities ORDER BY stage')
  )
  return result.rows.map((row) => row.stage)
}

/**
 * Returns a list of unique version numbers of a given dependency
 * @param pg
 * @param name
 * @param type
 * @param {import('@defra/cdp-metrics').Metrics} metrics
 * @return {Promise<string[]>}
 */
export async function uniqueVersionForDependency(pg, name, type, metrics) {
  const result = await metrics.timer(
    'UniqueVersionForDependencyDBLatencyMs',
    () =>
      pg.query(
        'SELECT DISTINCT version, version_num FROM dependencies WHERE name = $1 AND type = $2 ORDER BY version_num',
        [name, type]
      )
  )
  return result.rows.map((row) => row.version)
}

/**
 * Returns all the distinct entity tags (e.g. latest etc) without environment tags
 * @param pg
 * @param {import('@defra/cdp-metrics').Metrics} metrics
 * @return {Promise<string[]>}
 */
export async function uniqueEntityTags(pg, metrics) {
  const result = await metrics.timer('UniqueEntityTagsDBLatencyMs', () =>
    pg.query(
      `SELECT DISTINCT value
    FROM tags
    WHERE tags.value NOT IN (${environmentTags.map((tag) => `'${tag}'`).join(',')})
    ORDER BY value`
    )
  )
  return result.rows.map((row) => row.value)
}
