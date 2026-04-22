import { upsertEntity } from './upsert-entity.js'
import { describeWithDb } from '../../../testing/describe-with-db.js'
import { findEntityId } from './find-entity-id.js'
import { Metrics } from '@defra/cdp-metrics'

export const mockLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {}
}

describeWithDb('#upsertEntity', (test) => {
  test('it inserts an entity', async ({ pg }) => {
    const id = await upsertEntity(
      pg,
      'foo',
      '1.2.0',
      'run',
      new Metrics(mockLogger)
    )
    const foundId = await findEntityId(
      pg,
      'foo',
      '1.2.0',
      'run',
      new Metrics(mockLogger)
    )
    expect(foundId).toEqual(id)
  })
})
