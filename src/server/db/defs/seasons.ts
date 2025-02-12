export type SeasonId = number;
export type SeasonName = string;
export type SeasonDate = Date;

export type Season = {
  seasonId: SeasonId;
  seasonName: SeasonName;
  premiereDate: SeasonDate;
  finaleDate: SeasonDate | null;
};

export type NewSeason = {
  seasonName: SeasonName;
  premiereDate: SeasonDate;
};
