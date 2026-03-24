import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { Pool } from 'pg'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { bulkUpdateTags } from './manage-tags.js'
import { bulkUpdateLabels } from './manage-labels.js'
let container
let pool

const mockLogger = {
  info: () => {},
  warn: () => {},
  debug: () => {},
  error: () => {}
}

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:13.3-alpine')
    .withDatabase('cdp_sbom_explorer_backend')
    .start()
  pool = new Pool({ connectionString: container.getConnectionUri() })

  await runMigrations(pool)
}, 60000)

afterAll(async () => {
  await pool.end()
  await container.stop()
})

async function runMigrations(pool) {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const sql = readFileSync(join(__dirname, '../../../../schema.sql'), 'utf8')
  await pool.query(sql)
}

test('bulk insert tags', async () => {
  await bulkUpdateTags(
    { pg: pool, logger: mockLogger },
    [{ name: 'foo-backend', version: '1.1.1', value: 'latest' }],
    false
  )
  const { rows } = await pool.query("SELECT * FROM tags WHERE value = 'latest'")
  expect(rows).toHaveLength(1)
})

test('bulk updates existing tags', async () => {
  await bulkUpdateTags(
    { pg: pool, logger: mockLogger },
    [
      { name: 'foo-backend', version: '1.1.1', value: 'dev' },
      { name: 'bar-backend', version: '2.20.0', value: 'dev' }
    ],
    false
  )
  {
    const { rows } = await pool.query("SELECT * FROM tags WHERE value = 'dev'")
    expect(rows).toHaveLength(2)
  }
  await bulkUpdateTags(
    { pg: pool, logger: mockLogger },
    [
      { name: 'foo-backend', version: '1.2.1', value: 'dev' },
      { name: 'bar-backend', version: '2.20.0', value: 'dev' }
    ],
    false
  )

  {
    const { rows } = await pool.query(
      "SELECT * FROM tags WHERE value = 'dev' AND entity_name = 'foo-backend'"
    )
    expect(rows).toHaveLength(1)
    expect(rows[0].entity_version).toEqual('1.2.1')
  }
})

test('deletes existing tags that are not in the update set', async () => {
  await bulkUpdateTags(
    { pg: pool, logger: mockLogger },
    [
      { name: 'foo-backend', version: '1.1.1', value: 'test' },
      { name: 'bar-backend', version: '2.20.0', value: 'test' }
    ],
    false
  )
  {
    const { rows } = await pool.query("SELECT * FROM tags WHERE value = 'test'")
    expect(rows).toHaveLength(2)
  }
  await bulkUpdateTags(
    { pg: pool, logger: mockLogger },
    [{ name: 'foo-backend', version: '1.2.1', value: 'test' }],
    true
  )

  {
    const { rows } = await pool.query(
      "SELECT * FROM tags WHERE value = 'test' AND entity_name = 'bar-backend'"
    )
    expect(rows).toHaveLength(0)
  }
})

test('bulk insert labels', async () => {
  await bulkUpdateLabels({ pg: pool, logger: mockLogger }, 'team', [
    { name: 'foo-backend', value: 'team-1' },
    { name: 'bar-backend', value: 'team-2' }
  ])
  const { rows } = await pool.query("SELECT * FROM labels WHERE key = 'team'")
  expect(rows).toHaveLength(2)
})

test('bulk insert labels with multiple labels of same key per entity', async () => {
  await bulkUpdateLabels({ pg: pool, logger: mockLogger }, 'team', [
    { name: 'foo-backend', value: 'team-1' },
    { name: 'foo-backend', value: 'team-2' },
    { name: 'bar-backend', value: 'team-2' }
  ])
  const { rows } = await pool.query("SELECT * FROM labels WHERE key = 'team'")
  expect(rows).toHaveLength(3)
})

test('bulk insert labels removes old labels when clear flag is set', async () => {
  await bulkUpdateLabels(
    { pg: pool, logger: mockLogger },
    'team',
    [
      { name: 'foo-backend', value: 'team-1' },
      { name: 'foo-backend', value: 'team-2' },
      { name: 'bar-backend', value: 'team-2' }
    ],
    true
  )

  await bulkUpdateLabels(
    { pg: pool, logger: mockLogger },
    'team',
    [
      { name: 'foo-backend', value: 'team-1' },
      { name: 'bar-backend', value: 'team-2' }
    ],
    true
  )
  const { rows } = await pool.query("SELECT * FROM labels WHERE key = 'team'")
  expect(rows).toHaveLength(2)
})
