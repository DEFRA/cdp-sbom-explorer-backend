import { setInterval } from 'node:timers'

const TABLES = [
  'entities',
  'entity_dependencies',
  'dependencies',
  'tags',
  'labels'
]

function tableMetricPrefix(table) {
  const map = {
    entities: 'Entities',
    entity_dependencies: 'EntityDependencies',
    dependencies: 'Dependencies',
    tags: 'Tags',
    labels: 'Labels'
  }

  return map[table]
}

function startPostgresStatsPoller({ pg, logger }, metrics, { interval }) {
  logger.info('Starting Postgres table stats poller...')

  let running = false

  setInterval(async () => {
    if (running) return
    running = true

    try {
      logger.info('Running Postgres table stats poller')

      const tableStatsSql = `
        SELECT
          relname AS table,
          n_live_tup,
          n_dead_tup,
          seq_scan,
          idx_scan
        FROM pg_stat_user_tables
        WHERE relname = ANY($1)
      `

      const tableStatsResult = await pg.query(tableStatsSql, [TABLES])

      const counts = {}

      for (const row of tableStatsResult.rows) {
        const prefix = tableMetricPrefix(row.table)

        const liveTuples = Number(row.n_live_tup ?? 0)
        const deadTuples = Number(row.n_dead_tup ?? 0)
        const seqScans = Number(row.seq_scan ?? 0)
        const idxScans = Number(row.idx_scan ?? 0)

        counts[row.table] = liveTuples

        metrics.gauge(`${prefix}RowCount`, liveTuples)
        metrics.gauge(`${prefix}DeadTupleCount`, deadTuples)
        metrics.gauge(`${prefix}SeqScanCount`, seqScans)
        metrics.gauge(`${prefix}IndexScanCount`, idxScans)
      }

      const cacheSql = `
        SELECT
          COALESCE(sum(heap_blks_hit), 0) AS hits,
          COALESCE(sum(heap_blks_read), 0) AS reads
        FROM pg_statio_user_tables
      `

      const cacheResult = await pg.query(cacheSql)
      const cache = cacheResult.rows[0] ?? { hits: 0, reads: 0 }

      const hits = Number(cache.hits ?? 0)
      const reads = Number(cache.reads ?? 0)
      const hitRatio = hits + reads === 0 ? 1 : hits / (hits + reads)

      metrics.gauge('PostgresCacheHitRatio', hitRatio)

      const entities = counts.entities ?? 0
      const entityDependencies = counts.entity_dependencies ?? 0

      metrics.gauge(
        'DependenciesPerEntity',
        entities === 0 ? 0 : entityDependencies / entities
      )
    } catch (err) {
      logger.warn(err)
    } finally {
      running = false
    }
  }, interval)
}

export const pgTableStatsPoller = {
  plugin: {
    name: 'pg-table-stats',
    version: '1.0.0',
    register(server, options) {
      startPostgresStatsPoller(server, server.metrics(), options)
    }
  }
}
