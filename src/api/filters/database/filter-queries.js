async function uniqueDependencies(pg) {
  const result = await pg.query(
    'SELECT DISTINCT name, type FROM dependencies ORDER BY name'
  )
  return result.rows
}

async function uniqueDependenciesForType(pg, type) {
  const result = await pg.query(
    'SELECT DISTINCT name, type FROM dependencies  WHERE type = $1 ORDER BY name',
    [type]
  )
  return result.rows
}

async function uniqueDependenciesForTypeAndName(pg, type, partialName) {
  const result = await pg.query(
    'SELECT DISTINCT name, type FROM dependencies  WHERE type = $1 AND name like $2 ORDER BY name',
    [type, partialName]
  )
  return result.rows
}

async function uniqueDependenciesForNames(pg, partialName) {
  const result = await pg.query(
    'SELECT DISTINCT name, type FROM dependencies  WHERE name LIKE $1 ORDER BY name',
    [partialName]
  )
  return result.rows
}

async function uniqueDependenciesFiltered(pg, type, name) {
  const partialName = name ? `${name}%` : undefined
  if (type) {
    if (partialName) {
      return uniqueDependenciesForTypeAndName(pg, type, partialName)
    } else {
      return uniqueDependenciesForType(pg, type)
    }
  }

  if (partialName) {
    return uniqueDependenciesForNames(pg, partialName)
  }

  return uniqueDependencies(pg, type)
}

async function uniqueEntityStages(pg) {
  const result = await pg.query(
    'SELECT DISTINCT stage FROM entities ORDER BY stage'
  )
  return result.rows.map((row) => row.stage)
}

async function uniqueVersionForDependency(pg, name) {
  const result = await pg.query(
    'SELECT DISTINCT version FROM dependencies WHERE name = $1 ORDER BY version_num',
    [name]
  )
  return result.rows.map((row) => row.version)
}

export {
  uniqueEntityStages,
  uniqueDependencies,
  uniqueDependenciesFiltered,
  uniqueVersionForDependency
}
