export type Tribe = {
  tribeId: number;
  tribeName: string;
  tribeColor: string;
  seasonId: number | null;
};

export type TribeInsert = {
  tribeName: string;
  tribeColor: string;
};


/**
  * Record<episodeNumber, Record<tribeId, castawayId[]>>
  */
export type TribesTimeline = Record<number, Record<number, number[]>>
