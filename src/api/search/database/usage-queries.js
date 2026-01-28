export async function versionUsage(pg, type, partialName, environment) {
  const sql = `SELECT d.name, d.version, count(ed.dependency_id) as count
       FROM deployments as dpl
              JOIN entities as e ON e.name = dpl.name AND e.version = dpl.version
              JOIN entity_dependencies as ed ON e.id = ed.entity_id
              JOIN dependencies as d ON d.id = ed.dependency_id
       WHERE d.type = $1 AND d.name LIKE $2 AND dpl.environment = $3
       group by d.name, d.version
       order by d.name, d.version DESC, count DESC`

  const result = await pg.query(sql, [type, partialName, environment])
  return result.rows
}
