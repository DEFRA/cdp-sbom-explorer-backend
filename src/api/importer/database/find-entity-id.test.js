import { upsertEntity } from './upsert-entity.js'
import { describeWithDb } from '../../../testing/describe-with-db.js'
import { findEntityId } from './find-entity-id.js'

describeWithDb('#upsertEntity', (test) => {
  test('it inserts an entity', async ({ pg }) => {
    const id = await upsertEntity(pg, 'foo', '1.2.0', 'run')
    const foundId = await findEntityId(pg, 'foo', '1.2.0', 'run')
    expect(foundId).toEqual(id)
  })
})
