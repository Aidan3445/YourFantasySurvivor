import { DeleteLeague } from './memberEdit';
import { Popover, PopoverContent, PopoverTrigger } from '~/app/_components/commonUI/popover';
import CardContainer from '~/app/_components/cardContainer';
import { ToggleVisibility } from './toggleVis';
import { Checkbox } from '~/app/_components/commonUI/checkbox';
import { cn } from '~/lib/utils';

interface LeagueRulesProps {
  league: {
    id: number;
    name: string;
    season: string;
    locked: boolean;
    unique: boolean;
    picks: 1 | 2;
    password: string;
  };
  ownerLoggedIn: boolean;
  className?: string;
}

export default function LeagueDetails({ league, ownerLoggedIn, className }: LeagueRulesProps) {
  return (
    <Popover>
      <PopoverTrigger className={cn(className, 'hs-in p-1 rounded-md')}>
        Details
      </PopoverTrigger>
      <PopoverContent>
        <CardContainer className='flex flex-col gap-1 p-6'>
          <table>
            <tbody>
              <tr>
                <th className='pr-4 text-right'>Name</th>
                <td>{league.name}</td>
              </tr>
              <tr>
                <th className='pr-4 text-right'>Season</th>
                <td>{league.season}</td>
              </tr>
              {league.password &&
                <tr>
                  <th className='pr-4 text-right'>Password</th>
                  <td>
                    <ToggleVisibility text={league.password} />
                  </td>
                </tr>}
              {ownerLoggedIn &&
                <tr>
                  <th className='pr-4 text-right'>Delete League</th>
                  <DeleteLeague leagueId={league.id} />
                </tr>}
            </tbody>
          </table>
        </CardContainer>
      </PopoverContent>
    </Popover>
  );
}

interface BoolProps {
  value: boolean;
}

function Bool({ value }: BoolProps) {
  return (
    <Checkbox className='pointer-events-none' checked={value} />
  );
}


