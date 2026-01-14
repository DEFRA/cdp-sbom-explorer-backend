import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { describe, beforeAll, afterAll, test as base } from 'vitest'
import { newDb } from 'pg-mem'
import { Pool } from 'pg'

export function describeWithDb(name, fn) {
  describe(name, () => {
    let pgMem
    let pool

    beforeAll(async () => {
      pgMem = newDb({ autoCreateForeignKeyIndices: true })
      const schema = fs.readFileSync(
        path.join(process.cwd(), 'schema.sql'),
        'utf8'
      )

      pgMem.public.none(schema)

      const adapter = pgMem.adapters.createPg()
      const cfg = {
        Client: adapter.Client,
        database: 'cdp_sbom_explorer_backend'
      }
      pool = new Pool(cfg)
    })

    afterAll(async () => {
      await pool?.end()
    })

    const test = base.extend({
      // eslint-disable-next-line no-empty-pattern
      pg: async ({}, use) => use(pool)
    })

    fn(test)
  })
}
