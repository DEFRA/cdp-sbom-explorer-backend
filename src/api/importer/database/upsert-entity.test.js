import { upsertEntity } from './upsert-entity.js'
import { describeWithDb } from '../../../testing/describe-with-db.js'

describeWithDb('#upsertEntity', (test) => {
  test('it inserts an entity', async ({ pg }) => {
    const id = await upsertEntity(pg, 'foo', '1.2.0', 'run')
    expect(id).toBeDefined()
    const result = await pg.query(
      "SELECT name, version, stage FROM public.entities WHERE name = 'foo' and version = '1.2.0' and stage = 'run'"
    )
    expect(result.rows).toEqual([
      { name: 'foo', version: '1.2.0', stage: 'run' }
    ])
  })

  test('it ignores duplicates', async ({ pg }) => {
    const id1 = await upsertEntity(pg, 'dupe', '1.2.0', 'run')
    const id2 = await upsertEntity(pg, 'dupe', '1.2.0', 'run')
    expect(id1).toBeDefined()
    expect(id1).toEqual(id2)

    const result = await pg.query(
      "SELECT COUNT(*) FROM public.entities WHERE name = 'dupe' and version = '1.2.0' and stage = 'run'"
    )
    expect(result.rows).toEqual([{ count: 1 }])
  })

  test('it inserts different stages of the same entity', async ({ pg }) => {
    const runId = await upsertEntity(pg, 'bar', '1.99.0', 'run')
    expect(runId).toBeDefined()

    const buildId = await upsertEntity(pg, 'bar', '1.99.0', 'build')
    expect(buildId).toBeDefined()
    expect(runId).not.toEqual(buildId)

    const result = await pg.query(
      "SELECT name, version, stage FROM public.entities WHERE name = 'bar' AND version = '1.99.0'"
    )
    expect(result.rows).toEqual([
      { name: 'bar', version: '1.99.0', stage: 'run' },
      { name: 'bar', version: '1.99.0', stage: 'build' }
    ])
  })
})
