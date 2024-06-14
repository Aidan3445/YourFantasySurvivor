import { mouseOutLeaderboard, mouseOverLeaderboard } from './leaderboard';

interface ScoresProps {
    data: {
        name: string;
        color: string;
        score: number;
        episodeScores: number[]
    }[];
}

export default function Scores({ data }: ScoresProps) {
  if (!data.length) {
    data = Array<typeof data[number]>(18).fill({
      name: 'Loading...',
      color: 'hsl(0, 0%, 0%)]',
      score: 0,
      episodeScores: [0]
    }, 0, 18);
  }

  const names = data.map(d => d.name);

  return (
    <figure className='overflow-hidden gap-0 rounded-lg border border-black'>
      {data.map(({ name, color, score }, index) => (
        <div
          key={index}
          className={`flex justify-between px-2 cursor-pointer ${index & 1 ? 'bg-white/20' : 'bg-white/10'}`}
          onMouseOver={() => mouseOverLeaderboard(name, names)}
          onMouseOut={() => mouseOutLeaderboard(name, color, names)}>
          <h3 className='w-min'>{index + 1}</h3>
          <h3 id={`score-${name}`} className='font-semibold transition-all duration-150 text-nowrap' style={{ color: color }}>
            {name}
          </h3>
          <h3 className='text-right'>{score}</h3>
        </div>
      ))
      }
    </figure >
  );
}

