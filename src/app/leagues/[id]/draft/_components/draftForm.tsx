import { z } from 'zod';
import { type ComponentProps } from '~/lib/utils';
import { type SeasonEventRuleType } from '~/server/db/schema/seasonEvents';
import { PredictionInfo } from '../../_components/settings/draftInfo';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger } from '~/app/_components/commonUI/select';
import { type Tribe } from '~/server/db/schema/tribes';
import { type Member } from '~/app/api/leagues/query';
import { type CastawayDetails } from '~/app/api/seasons/[name]/castaways/query';
import { Circle } from 'lucide-react';

export interface DraftFormProps extends ComponentProps {
  pickCount: number;
  castaway?: SeasonEventRuleType[];
  tribe?: SeasonEventRuleType[];
  member?: SeasonEventRuleType[];
  picks: {
    castaways: CastawayDetails[];
    tribes: Tribe[];
    members: Member[];
  };
}

const draftSchema = z.object({
  firstPick: z.string(),
  secondPick: z.string().optional(),
  castaway: z.array(z.string()),
  tribe: z.array(z.string()),
  member: z.array(z.string())
});

export default async function DraftForm({
  pickCount,
  castaway,
  tribe,
  member,
  picks,
  className
}: DraftFormProps) {
  const castawaysByTribe: Record<string, CastawayDetails[]> = picks.castaways.reduce((acc, c) => {
    if (!acc[c.startingTribe.name]) acc[c.startingTribe.name] = [];
    acc[c.startingTribe.name]!.push(c);
    return acc;
  }, {} as Record<string, CastawayDetails[]>);


  return (
    <section className={className}>
      <h2 className='text-2xl text-center font-semibold'>
        Pick your Survivor{pickCount > 1 ? 's' : ''}
      </h2>
      <Select>
        <SelectTrigger>Remaining Survivors</SelectTrigger>
        <SelectContent>
          {picks.castaways.map((castaway) => (
            <SelectItem key={castaway.name} value={castaway.name}>
              {castaway.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {pickCount > 1 &&
        <Select>
          <SelectTrigger>Second Pick</SelectTrigger>
          <SelectContent>
            {picks.castaways.map((castaway) => (
              <SelectItem key={castaway.name} value={castaway.name}>
                {castaway.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>}
      {castaway &&
        <div>
          <br />
          <h2 className='text-2xl text-center font-semibold'>Castaway Predictions</h2>
          <div className='flex flex-col gap-1'>
            {castaway?.map((c, index) => (
              <PredictionInfo key={index} className='flex flex-col justify-center' prediction={c} parity={index % 2 === 0}>
                <Select>
                  <SelectTrigger>Choose</SelectTrigger>
                  <SelectContent>
                    {Object.keys(castawaysByTribe).map((tribe) => (
                      <SelectGroup key={tribe}>
                        <SelectLabel>{tribe}</SelectLabel>
                        {castawaysByTribe[tribe]!.map((castaway) => (
                          <SelectItem key={castaway.name} value={castaway.name}>
                            {castaway.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </PredictionInfo>
            ))}
          </div>
        </div>}
      {tribe &&
        <div>
          <br />
          <h2 className='text-2xl text-center font-semibold'>Tribe Predictions</h2>
          <div className='flex flex-col gap-1'>
            {tribe?.map((t, index) => (
              <PredictionInfo key={index} prediction={t} parity={index % 2 === 0}>
                <Select>
                  <SelectTrigger>Choose</SelectTrigger>
                  <SelectContent>
                    {picks.tribes.map((pick) => (
                      <SelectItem key={pick.name} value={pick.name}>
                        {pick.name}
                        <Circle fill={pick.color} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </PredictionInfo>
            ))}
          </div>
        </div>}
      {member &&
        <div>
          <br />
          <h2 className='text-2xl text-center font-semibold'>Member Predictions</h2>
          <div className='flex flex-col gap-1'>
            {member?.map((m, index) => (
              <PredictionInfo key={index} prediction={m} parity={index % 2 === 0}>
                <Select>
                  <SelectTrigger>Choose</SelectTrigger>
                  <SelectContent>
                    {picks.members.map((pick) => (
                      <SelectItem key={pick.displayName} value={pick.displayName}>
                        {pick.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </PredictionInfo>
            ))}
          </div>
        </div>}
    </section >
  );
}


