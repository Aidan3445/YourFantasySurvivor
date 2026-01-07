import { describe, it, expect, vi, beforeEach } from 'vitest';
import getKeyEpisodes from '~/services/seasons/query/getKeyEpisodes';
import type { Episode } from '~/types/episodes';

vi.mock('~/services/seasons/query/episodes', () => ({
  default: vi.fn(),
}));

import getEpisodes from '~/services/seasons/query/episodes';

const mockGetEpisodes = getEpisodes as ReturnType<typeof vi.fn>;

describe('getKeyEpisodes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createEpisode = (overrides: Partial<Episode>): Episode => ({
    seasonId: 1,
    episodeId: 1,
    episodeNumber: 1,
    title: 'Test Episode',
    airDate: new Date(),
    runtime: 60,
    airStatus: 'Upcoming',
    isMerge: false,
    isFinale: false,
    ...overrides,
  });

  it('should return all nulls when no episodes exist', async () => {
    mockGetEpisodes.mockResolvedValue([]);

    const result = await getKeyEpisodes(1);

    expect(result).toEqual({
      previousEpisode: null,
      nextEpisode: null,
      mergeEpisode: null,
    });
  });

  it('should identify previous episode as last Aired episode', async () => {
    const ep1 = createEpisode({ episodeNumber: 1, airStatus: 'Aired' });
    const ep2 = createEpisode({ episodeNumber: 2, airStatus: 'Aired' });
    const ep3 = createEpisode({ episodeNumber: 3, airStatus: 'Upcoming' });

    mockGetEpisodes.mockResolvedValue([ep1, ep2, ep3]);

    const result = await getKeyEpisodes(1);

    expect(result.previousEpisode).toEqual(ep2); // Most recent aired
    expect(result.nextEpisode).toEqual(ep3);
    expect(result.mergeEpisode).toBeNull();
  });

  it('should identify previous episode as currently Airing episode', async () => {
    const ep1 = createEpisode({ episodeNumber: 1, airStatus: 'Aired' });
    const ep2 = createEpisode({ episodeNumber: 2, airStatus: 'Airing' });
    const ep3 = createEpisode({ episodeNumber: 3, airStatus: 'Upcoming' });

    mockGetEpisodes.mockResolvedValue([ep1, ep2, ep3]);

    const result = await getKeyEpisodes(1);

    expect(result.previousEpisode).toEqual(ep2); // Currently airing
  });

  it('should identify next episode as first Upcoming episode', async () => {
    const ep1 = createEpisode({ episodeNumber: 1, airStatus: 'Aired' });
    const ep2 = createEpisode({ episodeNumber: 2, airStatus: 'Upcoming' });
    const ep3 = createEpisode({ episodeNumber: 3, airStatus: 'Upcoming' });

    mockGetEpisodes.mockResolvedValue([ep1, ep2, ep3]);

    const result = await getKeyEpisodes(1);

    expect(result.nextEpisode).toEqual(ep2); // First upcoming
  });

  it('should not update nextEpisode after finding first upcoming', async () => {
    const ep1 = createEpisode({ episodeNumber: 1, airStatus: 'Aired' });
    const ep2 = createEpisode({ episodeNumber: 2, airStatus: 'Upcoming' });
    const ep3 = createEpisode({ episodeNumber: 3, airStatus: 'Upcoming' });
    const ep4 = createEpisode({ episodeNumber: 4, airStatus: 'Upcoming' });

    mockGetEpisodes.mockResolvedValue([ep1, ep2, ep3, ep4]);

    const result = await getKeyEpisodes(1);

    expect(result.nextEpisode).toEqual(ep2); // Still first upcoming, not ep3 or ep4
  });

  it('should identify merge episode (not first upcoming)', async () => {
    const ep1 = createEpisode({ episodeNumber: 1, airStatus: 'Aired', isMerge: false });
    const ep2 = createEpisode({ episodeNumber: 2, airStatus: 'Aired', isMerge: false });
    const ep3 = createEpisode({ episodeNumber: 3, airStatus: 'Upcoming', isMerge: false });
    const ep4 = createEpisode({ episodeNumber: 4, airStatus: 'Upcoming', isMerge: true });

    mockGetEpisodes.mockResolvedValue([ep1, ep2, ep3, ep4]);

    const result = await getKeyEpisodes(1);

    expect(result.nextEpisode).toEqual(ep3); // First upcoming
    expect(result.mergeEpisode).toEqual(ep4); // Merge but not first upcoming
  });

  it('should handle merge episode that has already aired', async () => {
    const ep1 = createEpisode({ episodeNumber: 1, airStatus: 'Aired', isMerge: false });
    const ep2 = createEpisode({ episodeNumber: 2, airStatus: 'Aired', isMerge: true });
    const ep3 = createEpisode({ episodeNumber: 3, airStatus: 'Aired', isMerge: false });

    mockGetEpisodes.mockResolvedValue([ep1, ep2, ep3]);

    const result = await getKeyEpisodes(1);

    expect(result.previousEpisode).toEqual(ep3); // Most recent aired
    expect(result.mergeEpisode).toEqual(ep2);
  });

  it('should handle season with only aired episodes (no upcoming)', async () => {
    const ep1 = createEpisode({ episodeNumber: 1, airStatus: 'Aired' });
    const ep2 = createEpisode({ episodeNumber: 2, airStatus: 'Aired' });

    mockGetEpisodes.mockResolvedValue([ep1, ep2]);

    const result = await getKeyEpisodes(1);

    expect(result.previousEpisode).toEqual(ep2);
    expect(result.nextEpisode).toBeNull();
    expect(result.mergeEpisode).toBeNull();
  });

  it('should handle season with only upcoming episodes', async () => {
    const ep1 = createEpisode({ episodeNumber: 1, airStatus: 'Upcoming' });
    const ep2 = createEpisode({ episodeNumber: 2, airStatus: 'Upcoming' });

    mockGetEpisodes.mockResolvedValue([ep1, ep2]);

    const result = await getKeyEpisodes(1);

    expect(result.previousEpisode).toBeNull();
    expect(result.nextEpisode).toEqual(ep1); // First upcoming
    expect(result.mergeEpisode).toBeNull();
  });

  it('should handle currently airing episode being the merge', async () => {
    const ep1 = createEpisode({ episodeNumber: 1, airStatus: 'Aired', isMerge: false });
    const ep2 = createEpisode({ episodeNumber: 2, airStatus: 'Airing', isMerge: true });
    const ep3 = createEpisode({ episodeNumber: 3, airStatus: 'Upcoming', isMerge: false });

    mockGetEpisodes.mockResolvedValue([ep1, ep2, ep3]);

    const result = await getKeyEpisodes(1);

    expect(result.previousEpisode).toEqual(ep2); // Currently airing
    expect(result.nextEpisode).toEqual(ep3);
    expect(result.mergeEpisode).toEqual(ep2);
  });

  it('should overwrite previous episode with later aired episodes', async () => {
    const ep1 = createEpisode({ episodeNumber: 1, airStatus: 'Aired' });
    const ep2 = createEpisode({ episodeNumber: 2, airStatus: 'Aired' });
    const ep3 = createEpisode({ episodeNumber: 3, airStatus: 'Aired' });

    mockGetEpisodes.mockResolvedValue([ep1, ep2, ep3]);

    const result = await getKeyEpisodes(1);

    // Should be ep3, not ep1 or ep2
    expect(result.previousEpisode).toEqual(ep3);
  });

  it('should handle finale episode', async () => {
    const ep1 = createEpisode({ episodeNumber: 1, airStatus: 'Aired', isMerge: false, isFinale: false });
    const ep2 = createEpisode({ episodeNumber: 2, airStatus: 'Aired', isMerge: true, isFinale: false });
    const ep3 = createEpisode({ episodeNumber: 3, airStatus: 'Upcoming', isMerge: false, isFinale: true });

    mockGetEpisodes.mockResolvedValue([ep1, ep2, ep3]);

    const result = await getKeyEpisodes(1);

    expect(result.previousEpisode).toEqual(ep2);
    expect(result.nextEpisode).toEqual(ep3);
    expect(result.mergeEpisode).toEqual(ep2);
    // Finale is tracked in episode but not in KeyEpisodes type
  });
});
