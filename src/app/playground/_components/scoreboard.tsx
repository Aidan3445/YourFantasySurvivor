import { ColorRow, type ColorRowProps } from '~/app/leagues/[id]/_components/scores/membersScores';
import { mouseOutLeaderboard, mouseOverLeaderboard } from './leaderboard';

interface ScoresProps {
  data: {
    name: string;
    url: string;
    color: string;
    score: number;
    episodeScores: number[]
  }[];
}

export default function Scores({ data }: ScoresProps) {
  if (!data.length) {
    data = Array<typeof data[number]>(18).fill({
      name: 'Loading...',
      url: '#',
      color: 'hsl(0, 0%, 0%)]',
      score: 0,
      episodeScores: [0]
    }, 0, 18);
  }

  const names = data.map(d => d.name);

  return (
    <table>
      <thead>
        <tr>
          <th>
            <ColorRow color='white' className='py-1 text-xs flex justify-center'>
              <h3>Place</h3>
            </ColorRow>
          </th>
          <th>
            <ColorRow color='white' className='py-1 text-xs flex justify-center'>
              <h3>Member</h3>
            </ColorRow>
          </th>
          <th>
            <ColorRow color='white' className='py-1 text-xs flex justify-center'>
              <h3>Points</h3>
            </ColorRow>
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map(({ name, url, color, score }, index) => {
          return (
            <tr key={index}>
              <td>
                <ColorRowWrapper
                  color={color}
                  names={names}
                  name={name}
                  url={url}>
                  {index + 1}
                </ColorRowWrapper>
              </td>
              <td>
                <ColorRowWrapper
                  color={color}
                  names={names}
                  name={name}
                  url={url}>
                  {name}
                </ColorRowWrapper>
              </td>
              <td>
                <ColorRowWrapper
                  color={color}
                  names={names}
                  name={name}
                  url={url}>
                  {score}
                </ColorRowWrapper>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

interface ColorRowWrapperProps extends ColorRowProps {
  name: string;
  url: string;
  names: string[];
}

export function ColorRowWrapper({ name, url, names, color, children }: ColorRowWrapperProps) {
  return (
    <a
      href={url}
      onMouseOver={() => mouseOverLeaderboard(name, names)}
      onMouseOut={() => mouseOutLeaderboard(name, color, names)}>
      <ColorRow color={color} className='py-1 text-xs flex justify-center'>
        <h3 className='text-white'>{children}</h3>
      </ColorRow>
    </a>
  );
}

