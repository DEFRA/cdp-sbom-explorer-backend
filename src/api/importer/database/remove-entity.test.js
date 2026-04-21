import { upsertEntity } from './upsert-entity.js'
import { describeWithDb } from '../../../testing/describe-with-db.js'
import { removeEntity } from './remove-entity.js'
import { Metrics } from '@defra/cdp-metrics'

describeWithDb('#removeEntity', (test) => {
  test('it removes the entity and all its dependencies', async ({ pg }) => {
    const metrics = new Metrics(null)
    const keepId = await upsertEntity(pg, 'foo', '1.1.0', 'run', metrics)
    const removeId = await upsertEntity(pg, 'foo', '1.2.0', 'run', metrics)

    {
      const result = await pg.query('SELECT id FROM entities')
      expect(result.rows).toEqual([{ id: 1 }, { id: 2 }])
    }

    const depInsert = await pg.query(
      'INSERT INTO dependencies (type, name, version, version_num) VALUES ($1, $2, $3, $4) RETURNING id',
      ['npm', 'joi', '1.0.0', 100]
    )
    const depId = depInsert.rows[0].id

    await pg.query(
      'INSERT INTO entity_dependencies (entity_id, dependency_id) VALUES ($1, $2)',
      [keepId, depId]
    )
    await pg.query(
      'INSERT INTO entity_dependencies (entity_id, dependency_id) VALUES ($1, $2)',
      [removeId, depId]
    )

    await removeEntity(pg, removeId, new Metrics(null))

    const result = await pg.query('SELECT id FROM entities')
    expect(result.rows).toEqual([{ id: keepId }])

    const depResult = await pg.query('SELECT * FROM entity_dependencies')
    expect(depResult.rows).toEqual([
      { entity_id: keepId, dependency_id: depId }
    ])
  })
})
