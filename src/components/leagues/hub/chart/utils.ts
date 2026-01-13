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
      formattedData[episodeNumber] ??= {
        episode: episodeNumber
      };
      const episode = formattedData[episodeNumber];
      episode[data.name] = value;
    });
  });

  return formattedData.filter((ep) => ep.episode === '' ||
    (typeof ep.episode === 'number' && ep.episode >= startWeek));
}

export function formatDataForMui({ data, startWeek }: ScoreChartProps) {
  const xAxisData: (string | number)[] = [''];
  const series = data.map((member) => {
    const seriesData: (number | null)[] = [0];

    member.episodeScores.forEach((score, episodeNumber) => {
      if (episodeNumber < startWeek) return;

      if (seriesData.length === 1 && episodeNumber > startWeek) {
        for (let i = startWeek; i < episodeNumber; i++) {
          if (!xAxisData.includes(i)) {
            xAxisData.push(i);
          }
          seriesData.push(null);
        }
      }

      if (!xAxisData.includes(episodeNumber)) {
        xAxisData.push(episodeNumber);
      }

      seriesData.push(score);
    });

    return {
      label: member.name,
      data: seriesData,
      color: member.color,
      curve: 'linear' as const,
    };
  });

  return { xAxisData, series };
}
