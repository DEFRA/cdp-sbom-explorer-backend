import Boom from '@hapi/boom'

import { teamsUpdateSchema } from '../schemas/schemas.js'
import { bulkUpdateLabels } from '../database/manage-labels.js'

/**
 * Receives service ownership info from portal
 * Expects { name: 'dev', teams: ['team1', 'team2'] }
 */
export const pushTeamsController = {
  options: {
    validate: {
      payload: teamsUpdateSchema,
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const payload = request?.payload

    // unwind teams
    const teamLabels = payload.flatMap((p) =>
      p.teams.map((t) => ({ name: p.name, value: t }))
    )

    const result = await bulkUpdateLabels(request, 'team', teamLabels, true)
    return h.response({ teamsProvided: teamLabels.length, result }).code(200)
  }
}
