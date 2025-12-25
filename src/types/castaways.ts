export type Castaway = {
  castawayId: number;
  fullName: string;
  shortName: string;
  age: number;
  hometown: string;
  residence: string;
  occupation: string;
  imageUrl: string;
  seasonId: number | null;
};

export type EnrichedCastaway = Castaway & {
  tribe: {
    name: string;
    color: string;
  } | null;
  eliminatedEpisode: number | null;
};

export type CastawayInsert = {
  fullName: string;
  shortName: string;
  age: number;
  residence: string;
  occupation: string;
  imageUrl: string;
  tribe: string;
  previouslyOn?: string[];
}
