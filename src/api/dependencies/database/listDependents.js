import environmentTags from '../../../common/constants/environmentTags.js'

const whereClauses = {
  name: (idx) => `d.name = $${idx}`,
  type: (idx) => `d.type = $${idx}`,
  gteVersion: (idx) => `d.version_num >= $${idx}`,
  lteVersion: (idx) => `d.version_num <= $${idx}`,
  environment: (idx) => `env.value = $${idx}`,
  team: (idx) => `teams.value = $${idx}`,
  tag: (idx) => `tg.value = $${idx}`,
  entity: (idx) => `e.name = $${idx}`
}

export async function listDependents(pg, query, limit = 100, offset = 0) {
  const keys = Object.keys(query).filter((q) => whereClauses[q])
  if (keys.length === 0) {
    throw new Error(
      `Invalid query [${Object.keys(query).join(', ')}] can only use [${Object.keys(whereClauses).join(', ')}] `
    )
  }

  const where = []
  const values = []

  for (const key of keys) {
    if (whereClauses[key]) {
      where.push(whereClauses[key](where.length + 1))
      values.push(query[key])
    }
  }

  const sql = `
    SELECT * FROM
    (
      SELECT COUNT(*) OVER() AS _total, e.name, e.version, d.version AS depversion,
            array_remove(array_agg(DISTINCT env.value::TEXT), NULL) AS environments,
            array_remove(array_agg(DISTINCT teams.value::TEXT), NULL) AS teams,
            array_remove(array_agg(DISTINCT tg.value::TEXT), NULL) AS tags
      FROM entity_dependencies AS ed
      JOIN entities AS e ON e.id = ed.entity_id
      JOIN dependencies AS d ON d.id = ed.dependency_id
      LEFT JOIN deployments AS dpl ON dpl.name = e.name AND dpl.version = e.version
      LEFT JOIN labels AS teams ON teams.entity_name = e.name AND teams.key = 'team'
      LEFT JOIN tags AS tg ON tg.entity_name = e.name AND tg.entity_version = e.version AND tg.value NOT IN (${environmentTags.map((tag) => `'${tag}'`).join(',')})
      LEFT JOIN tags AS env ON tg.entity_name = e.name AND tg.entity_version = e.version AND env.value IN (${environmentTags.map((tag) => `'${tag}'`).join(',')})
      WHERE ${where.join(' AND ')}
      GROUP BY e.name, e.version, d.version
    ) AS r
    ORDER BY r.name ASC, r.version DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `

  const result = await pg.query(sql, values)

  const total = result.rows.at(0)?._total ?? 0
  return {
    rows: result.rows.map(({ _total, ...columns }) => ({ ...columns })),
    meta: {
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}
