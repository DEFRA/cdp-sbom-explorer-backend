import environmentTags from '../../../common/constants/environmentTags.js'

const whereClauses = {
  entityName: (idx) => `e.name = $${idx}`,
  entityVersion: (idx) => `e.version = $${idx}`,
  type: (idx) => `d.type = $${idx}`,
  version: (idx) => `d.version = $${idx}`,
  name: (idx) => `d.name = $${idx}`
}

export async function listDependencies(pg, query, limit = 100, offset = 0) {
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
      SELECT COUNT(*) OVER() AS _total, e.version as entityversion, d.type, d.name, d.version AS version,
            array_remove(array_agg(DISTINCT tg.value::TEXT), NULL) AS entitytags
      FROM entity_dependencies AS ed
      JOIN entities AS e ON e.id = ed.entity_id
      JOIN dependencies AS d ON d.id = ed.dependency_id
      LEFT JOIN tags AS tg ON tg.entity_name = e.name AND tg.entity_version = e.version AND tg.value NOT IN (${environmentTags.map((tag) => `'${tag}'`).join(',')})
      WHERE ${where.join(' AND ')}
      GROUP BY e.version, d.type, d.name, d.version
    ) AS r
    ORDER BY r.version DESC, r.name, r.type
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
