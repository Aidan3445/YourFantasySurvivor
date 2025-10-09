type FormattedData = {
  episode: string | number;
  [key: string]: number | string;
}[];

type ScoreChartProps = {
  data: {
    name: string;
    episodeScores: number[];
    color: string;
  }[];
  startWeek: number;
};

export function formatData({ data, startWeek }: ScoreChartProps) {
  const formattedData: FormattedData = [{ episode: '' }];
  data.forEach((data) => {
    const ep1 = formattedData[0]!;
    ep1[data.name] = 0;

    data.episodeScores.forEach((value, episodeNumber) => {
      if (episodeNumber < startWeek) return;
      if (!formattedData[episodeNumber]) {
        formattedData[episodeNumber] = {
          episode: episodeNumber,
        };
      }
      const episode = formattedData[episodeNumber];
      episode[data.name] = value;
    });
  });

  return formattedData.filter((ep) => ep.episode === '' ||
    (typeof ep.episode === 'number' && ep.episode >= startWeek));
}
