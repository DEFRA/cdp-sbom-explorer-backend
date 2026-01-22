import { describeWithDb } from '../../../testing/describe-with-db.js'
import {
  uniqueEntityStages,
  uniqueVersionForDependency
} from './filter-queries.js'

describeWithDb('#uniqueEntityStages', (test) => {
  test('provides a list of all unique stages', async ({ pg }) => {
    await pg.query(
      `INSERT INTO entities (name, version, stage)
                     VALUES ($1, $2, $3)`,
      ['foo', '1.0.0', 'run']
    )
    await pg.query(
      `INSERT INTO entities (name, version, stage)
                     VALUES ($1, $2, $3)`,
      ['foo', '1.0.1', 'run']
    )
    await pg.query(
      `INSERT INTO entities (name, version, stage)
                     VALUES ($1, $2, $3)`,
      ['foo', '1.0.0', 'development']
    )

    const stages = await uniqueEntityStages(pg)
    expect(stages).toEqual(['development', 'run'])
  })
})

describeWithDb('#uniqueVersionForDependency', (test) => {
  test('provides a list of all versions of a dependency', async ({ pg }) => {
    await pg.query(
      `INSERT INTO dependencies (type, name, version, version_num)
                     VALUES ($1, $2, $3, $4)`,
      ['npm', 'pino', '1.0.0', 1]
    )

    await pg.query(
      `INSERT INTO dependencies (type, name, version, version_num)
                    VALUES ($1, $2, $3, $4)`,
      ['npm', 'pino', '1.0.1', 2]
    )

    await pg.query(
      `INSERT INTO dependencies (type, name, version, version_num)
                    VALUES ($1, $2, $3, $4)`,
      ['npm', 'pino', '1.2.0', 22]
    )

    await pg.query(
      `INSERT INTO dependencies (type, name, version, version_num)
                    VALUES ($1, $2, $3, $4)`,
      ['npm', 'pg-pool', '3.10.1', 44]
    )

    const versions = await uniqueVersionForDependency(pg, 'pino', 'npm')
    expect(versions).toEqual(['1.0.0', '1.0.1', '1.2.0'])
  })
})
