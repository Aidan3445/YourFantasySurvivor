import 'server-only';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { leagueSchema } from '~/server/db/schema/leagues';
import { episodeSchema } from '~/server/db/schema/episodes';
import { customEventReferenceSchema, customEventRuleSchema, customEventSchema } from '~/server/db/schema/customEvents';
import { type EventWithReferences } from '~/types/events';

/**
  * Get the custom events for a league
  * @param hash The hash of the league
  * @returns the custom league events
  * @returnObj `Record<episodeNumber, Record<eventId, EventWithReferences>>`
  */
export default async function getCustomEvents(hash: string) {
  return db
    .select({
      episodeNumber: episodeSchema.episodeNumber,
      customEventRuleId: customEventSchema.customEventRuleId,
      eventName: customEventRuleSchema.eventName,
      eventType: customEventRuleSchema.eventType,
      label: customEventSchema.label,
      referenceType: customEventReferenceSchema.referenceType,
      referenceId: customEventReferenceSchema.referenceId,
      notes: customEventSchema.notes,
    })
    .from(customEventSchema)
    .innerJoin(customEventRuleSchema, eq(customEventRuleSchema.customEventRuleId, customEventSchema.customEventRuleId))
    .innerJoin(leagueSchema, eq(leagueSchema.leagueId, customEventRuleSchema.leagueId))
    .innerJoin(episodeSchema, eq(episodeSchema.episodeId, customEventSchema.episodeId))
    .innerJoin(customEventReferenceSchema, eq(customEventReferenceSchema.customEventId, customEventSchema.customEventId))
    .where(eq(leagueSchema.hash, hash))
    .orderBy(episodeSchema.episodeNumber)
    .then(rows => rows.reduce((acc, row) => {
      acc[row.episodeNumber] ??= [];
      const events = acc[row.episodeNumber]!;
      events[row.customEventRuleId] ??= {
        eventSource: 'Custom',
        eventType: row.eventType,
        episodeNumber: row.episodeNumber,
        eventId: row.customEventRuleId,
        eventName: row.eventName,
        label: row.label,
        notes: row.notes,
        references: []
      };
      events[row.customEventRuleId]!.references.push({
        type: row.referenceType,
        id: row.referenceId
      });
      return acc;
    }, {} as Record<number, Record<number, EventWithReferences>>));
}
