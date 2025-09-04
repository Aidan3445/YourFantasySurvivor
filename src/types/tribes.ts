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
