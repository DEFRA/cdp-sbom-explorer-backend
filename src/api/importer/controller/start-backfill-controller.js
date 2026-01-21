import { initBackfill } from '../backfill/init-backfill.js'

const startBackfillController = {
  handler: async (request, h) => {
    initBackfill(request).then((r) => request.logger.info('done'))
    return h.response('started').code(200)
  }
}

export { startBackfillController }
