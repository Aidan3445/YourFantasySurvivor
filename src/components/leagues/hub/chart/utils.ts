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
  };
  
export function formatData({ data }: ScoreChartProps) {
    const formattedData: FormattedData = [{ episode: '' }];
    data.forEach((data) => {
      const ep1 = formattedData[0]!;
      ep1[data.name] = 0;
  
      data.episodeScores.forEach((value, episodeNumber) => {
        if (!formattedData[episodeNumber]) {
          formattedData[episodeNumber] = {
            episode: episodeNumber,
          };
        }
        const episode = formattedData[episodeNumber];
        episode[data.name] = value;
      });
    });
  
    return formattedData;
  }