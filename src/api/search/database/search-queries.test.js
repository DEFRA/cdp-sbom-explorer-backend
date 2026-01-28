import { buildSearchQuery } from './search-queries.js'

describe('#search-queries', () => {
  describe('#build-query', () => {
    const baseSql =
      'SELECT e.name, e.version, e.stage, d.version as depversion, d.type as deptype FROM entity_dependencies as ed JOIN entities as e ON e.id = ed.entity_id JOIN dependencies as d ON d.id = ed.dependency_id'

    const endSql = 'ORDER BY d.version_num DESC, e.name ASC'

    const deploymentsJoin =
      'JOIN deployments as dpl ON dpl.name = e.name AND dpl.version = e.version'

    test('name', () => {
      const query = buildSearchQuery({ name: 'bar' })
      expect(query.sql).toEqual(`${baseSql} WHERE d.name = $1 ${endSql}`)
      expect(query.values).toEqual(['bar'])
    })

    test('version', () => {
      const query = buildSearchQuery({ version: '1.2.3' })
      expect(query.sql).toEqual(`${baseSql} WHERE d.version = $1 ${endSql}`)
      expect(query.values).toEqual(['1.2.3'])
    })

    test('type', () => {
      const query = buildSearchQuery({ type: 'npm' })
      expect(query.sql).toEqual(`${baseSql} WHERE d.type = $1 ${endSql}`)
      expect(query.values).toEqual(['npm'])
    })

    test('lte', () => {
      const query = buildSearchQuery({ lte: 10 })
      expect(query.sql).toEqual(
        `${baseSql} WHERE d.version_num <= $1 ${endSql}`
      )
      expect(query.values).toEqual([10])
    })

    test('gte', () => {
      const query = buildSearchQuery({ gte: 10 })
      expect(query.sql).toEqual(
        `${baseSql} WHERE d.version_num >= $1 ${endSql}`
      )
      expect(query.values).toEqual([10])
    })

    test('stage', () => {
      const query = buildSearchQuery({ stage: 'run' })
      expect(query.sql).toEqual(`${baseSql} WHERE e.stage = $1 ${endSql}`)
      expect(query.values).toEqual(['run'])
    })

    test('environment', () => {
      const query = buildSearchQuery({ environment: 'dev' })
      expect(query.sql).toEqual(
        `${baseSql} ${deploymentsJoin} WHERE dpl.environment = $1 ${endSql}`
      )
      expect(query.values).toEqual(['dev'])
    })

    test('name, version', () => {
      const query = buildSearchQuery({ name: 'bar', version: '1.2.3' })
      expect(query.sql).toEqual(
        `${baseSql} WHERE d.name = $1 AND d.version = $2 ${endSql}`
      )
      expect(query.values).toEqual(['bar', '1.2.3'])
    })

    test('name, version, type', () => {
      const query = buildSearchQuery({
        name: 'bar',
        version: '1.2.3',
        type: 'npm'
      })
      expect(query.sql).toEqual(
        `${baseSql} WHERE d.name = $1 AND d.version = $2 AND d.type = $3 ${endSql}`
      )
      expect(query.values).toEqual(['bar', '1.2.3', 'npm'])
    })

    test('name, versionRange', () => {
      const query = buildSearchQuery({ name: 'bar', gte: 10, lte: 20 })
      expect(query.sql).toEqual(
        `${baseSql} WHERE d.name = $1 AND d.version_num >= $2 AND d.version_num <= $3 ${endSql}`
      )
      expect(query.values).toEqual(['bar', 10, 20])
    })

    test('name, versionRange environment', () => {
      const query = buildSearchQuery({
        name: 'bar',
        gte: 10,
        lte: 20,
        environment: 'dev'
      })
      expect(query.sql).toEqual(
        `${baseSql} ${deploymentsJoin} WHERE d.name = $1 AND d.version_num >= $2 AND d.version_num <= $3 AND dpl.environment = $4 ${endSql}`
      )
      expect(query.values).toEqual(['bar', 10, 20, 'dev'])
    })

    test('invalid', () => {
      const query = buildSearchQuery({ baz: 'bar' })
      expect(query).toBeUndefined()
    })

    test('name, invalid', () => {
      const query = buildSearchQuery({ name: 'bar', baz: 'bar' })
      expect(query.values).toEqual(['bar'])
    })
  })
})
