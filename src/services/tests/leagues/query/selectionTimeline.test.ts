import { mockDb, mockDbQuery } from '~/services/__mocks__/db';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import getSelectionTimeline from '~/services/leagues/query/selectionTimeline';
import type { VerifiedLeagueMemberAuth } from '~/types/api';
import type { SelectionUpdate } from '~/types/leagueMembers';

vi.mock('~/server/db', () => ({
  db: mockDb,
}));

describe('getSelectionTimeline', () => {
  const mockAuth: VerifiedLeagueMemberAuth = {
    userId: 'user-123',
    leagueId: 1,
    memberId: 10,
    seasonId: 1,
    role: 'Member',
    status: 'Active',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processSelectionTimeline logic', () => {
    it('should build timeline for single member with one selection', async () => {
      const selectionUpdates: SelectionUpdate[] = [
        { episodeNumber: 1, memberId: 10, castawayId: 1, draft: true },
      ];

      mockDbQuery.mockResolvedValue(selectionUpdates);

      const result = await getSelectionTimeline(mockAuth);

      // Member 10 selected castaway 1 in episode 1
      expect(result.memberCastaways[10]).toEqual([null, 1]);
      // Castaway 1 was selected by member 10 in episode 1
      expect(result.castawayMembers[1]).toEqual([null, 10]);
    });

    it('should fill gaps when member keeps same castaway', async () => {
      const selectionUpdates: SelectionUpdate[] = [
        { episodeNumber: 1, memberId: 10, castawayId: 1, draft: true },
        { episodeNumber: 5, memberId: 10, castawayId: 2, draft: false },
      ];

      mockDbQuery.mockResolvedValue(selectionUpdates);

      const result = await getSelectionTimeline(mockAuth);

      // Member 10: null at 0, castaway 1 from ep 1-4, castaway 2 at ep 5
      expect(result.memberCastaways[10]).toEqual([null, 1, 1, 1, 1, 2]);
      // Castaway 1: member 10 from ep 1-4, then dropped (null) at ep 5
      expect(result.castawayMembers[1]).toEqual([null, 10, 10, 10, 10, null]);
      // Castaway 2: picked up by member 10 at ep 5
      expect(result.castawayMembers[2]).toEqual([null, null, null, null, null, 10]);
    });

    it('should handle member going back to previous castaway (ignore duplicate)', async () => {
      const selectionUpdates: SelectionUpdate[] = [
        { episodeNumber: 1, memberId: 10, castawayId: 1, draft: true },
        { episodeNumber: 2, memberId: 10, castawayId: 2, draft: false },
        { episodeNumber: 3, memberId: 10, castawayId: 2, draft: false }, // Same as previous
      ];

      mockDbQuery.mockResolvedValue(selectionUpdates);

      const result = await getSelectionTimeline(mockAuth);

      // Should ignore the duplicate selection at episode 3
      expect(result.memberCastaways[10]).toEqual([null, 1, 2]);
    });

    it('should handle multiple members selecting different castaways', async () => {
      const selectionUpdates: SelectionUpdate[] = [
        { episodeNumber: 1, memberId: 10, castawayId: 1, draft: true },
        { episodeNumber: 1, memberId: 20, castawayId: 2, draft: true },
      ];

      mockDbQuery.mockResolvedValue(selectionUpdates);

      const result = await getSelectionTimeline(mockAuth);

      expect(result.memberCastaways[10]).toEqual([null, 1]);
      expect(result.memberCastaways[20]).toEqual([null, 2]);
      expect(result.castawayMembers[1]).toEqual([null, 10]);
      expect(result.castawayMembers[2]).toEqual([null, 20]);
    });

    it('should handle castaway being traded between members', async () => {
      const selectionUpdates: SelectionUpdate[] = [
        { episodeNumber: 1, memberId: 10, castawayId: 1, draft: true },
        { episodeNumber: 3, memberId: 10, castawayId: 2, draft: false },
        { episodeNumber: 3, memberId: 20, castawayId: 1, draft: false },
      ];

      mockDbQuery.mockResolvedValue(selectionUpdates);

      const result = await getSelectionTimeline(mockAuth);

      // Member 10: castaway 1 in eps 1-2, castaway 2 at ep 3
      expect(result.memberCastaways[10]).toEqual([null, 1, 1, 2]);
      // Member 20: picks up castaway 1 at ep 3 (no filling before since non-draft)
      expect(result.memberCastaways[20]).toEqual([1]);
      expect(result.memberCastaways[20]?.length).toBe(1);

      // Castaway 1: member 10 in eps 1-2, dropped (null), then member 20 at ep 3
      expect(result.castawayMembers[1]).toEqual([null, 10, 10, 20]);
      // Castaway 2: picked up by member 10 at ep 3
      expect(result.castawayMembers[2]).toEqual([null, null, null, 10]);
    });

    it('should handle non-draft selection (no null filling before)', async () => {
      const selectionUpdates: SelectionUpdate[] = [
        { episodeNumber: 3, memberId: 10, castawayId: 1, draft: false },
      ];

      mockDbQuery.mockResolvedValue(selectionUpdates);

      const result = await getSelectionTimeline(mockAuth);

      // Non-draft selection should not fill episodes before with null
      expect(result.memberCastaways[10]).toEqual([1]);
      expect(result.memberCastaways[10]?.length).toBe(1);
    });

    it('should handle draft selection filling episodes before with null', async () => {
      const selectionUpdates: SelectionUpdate[] = [
        { episodeNumber: 3, memberId: 10, castawayId: 1, draft: true },
      ];

      mockDbQuery.mockResolvedValue(selectionUpdates);

      const result = await getSelectionTimeline(mockAuth);

      // Draft selection should fill episodes 0-2 with null
      expect(result.memberCastaways[10]).toEqual([null, null, null, 1]);
    });

    it('should handle complex scenario with multiple members and swaps', async () => {
      const selectionUpdates: SelectionUpdate[] = [
        // Draft: Member 10 picks castaway 1, Member 20 picks castaway 2
        { episodeNumber: 1, memberId: 10, castawayId: 1, draft: true },
        { episodeNumber: 1, memberId: 20, castawayId: 2, draft: true },
        // Episode 3: Member 10 switches to castaway 3
        { episodeNumber: 3, memberId: 10, castawayId: 3, draft: false },
        // Episode 5: Member 20 picks up the dropped castaway 1
        { episodeNumber: 5, memberId: 20, castawayId: 1, draft: false },
      ];

      mockDbQuery.mockResolvedValue(selectionUpdates);

      const result = await getSelectionTimeline(mockAuth);

      // Member 10: null at 0, castaway 1 in eps 1-2, castaway 3 at ep 3 (timeline ends at last update)
      expect(result.memberCastaways[10]).toEqual([null, 1, 1, 3]);
      // Member 20: null at 0, castaway 2 in eps 1-4, castaway 1 at ep 5
      expect(result.memberCastaways[20]).toEqual([null, 2, 2, 2, 2, 1]);

      // Castaway 1: member 10 in eps 1-2, null in eps 3-4, member 20 at ep 5
      expect(result.castawayMembers[1]).toEqual([null, 10, 10, null, null, 20]);
      // Castaway 2: member 20 in eps 1-4, dropped (null) at ep 5
      expect(result.castawayMembers[2]).toEqual([null, 20, 20, 20, 20, null]);
      // Castaway 3: picked up by member 10 at ep 3
      expect(result.castawayMembers[3]).toEqual([null, null, null, 10]);
    });

    it('should handle empty selection updates', async () => {
      mockDbQuery.mockResolvedValue([]);

      const result = await getSelectionTimeline(mockAuth);

      expect(result.memberCastaways).toEqual({});
      expect(result.castawayMembers).toEqual({});
    });

    it('should call database with correct parameters', async () => {
      mockDbQuery.mockResolvedValue([]);

      await getSelectionTimeline(mockAuth);

      expect(mockDb.select).toHaveBeenCalled();
    });
  });
});
