import { upsertEntity } from './upsert-entity.js'
import { describeWithDb } from '../../../testing/describe-with-db.js'

describeWithDb('#upsertEntity', (test) => {
  test('it inserts an entity', async ({ pg }) => {
    const id = await upsertEntity(pg, 'foo', '1.2.0', 'run')
    expect(id).toBeDefined()
    const result = await pg.query(
      "SELECT name, version, stage FROM public.entities WHERE name = 'foo' and version = '1.2.0'"
    )
    expect(result.rows).toEqual([
      { name: 'foo', version: '1.2.0', stage: 'run' }
    ])
  })
})
