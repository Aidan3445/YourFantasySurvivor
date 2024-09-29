'use client';
import { getContrastingColor } from '@uiw/color-convert';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/app/_components/commonUI/select';
import { type CastawayDetails } from '~/server/db/schema/castaways';
import { castawaysByTribe } from '~/lib/utils';
import { ColorRow } from '../leagues/[id]/_components/scores/membersScores';
import { type FieldValues, type ControllerRenderProps, type Path } from 'react-hook-form';
import { type Tribe } from '~/server/db/schema/tribes';
import { type Member } from '~/server/db/schema/members';

export interface SelectSeasonProps {
  className?: string;
  selectDefault?: boolean;
}

export default function SelectSeason({ className, selectDefault = false }: SelectSeasonProps) {
  const [seasons, setSeasons] = useState<string[]>([]);
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    fetch('/api/seasons')
      .then((res) => res.json())
      .then((data: string[]) => {
        setSeasons(data);
      })
      .catch((err) => console.error(err));
  }, [router, params]);

  const updateSeason = (newSeason: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('season', newSeason);
    router.push(url.search, { scroll: false });
  };

  let season = params.get('season') ?? '';
  // if select default then set the first season as default
  if (selectDefault && !season) {
    season = seasons[0] ?? '';
  }

  return (
    <Select defaultValue={season} value={season} onValueChange={(value) => updateSeason(value)}>
      <SelectTrigger className={className}>
        <br />
        <SelectValue placeholder='Select Season' defaultValue={'fdfdf'} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Select Season</SelectLabel>
          {seasons?.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectGroup>
      </SelectContent>
    </Select >
  );
}

interface SelectCastawaysProps<T extends FieldValues> {
  castaways: CastawayDetails[];
  otherChoices?: CastawayDetails[];
  field: ControllerRenderProps<T, Path<T>>;
}

export function SelectCastaways<T extends FieldValues>(
  { castaways, otherChoices, field }:
    SelectCastawaysProps<T>) {
  const byTribe = castawaysByTribe(castaways);

  return (
    <Select onValueChange={field.onChange} {...field}>
      <SelectTrigger className='w-60'>
        <div className='flex-grow text-nowrap'>
          <SelectValue placeholder='Choose your Survivor' />
        </div>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(byTribe).map(([tribe, tribeMembers]) => {
          tribeMembers = tribeMembers.filter((castaway) => !otherChoices?.some((s) => s.name === castaway.name));
          if (!tribeMembers.length) return null;
          return (
            <SelectGroup key={tribe}>
              <SelectLabel>
                <ColorRow color={tribeMembers[0]!.startingTribe.color} className='px-4 -mx-4 w-full italic'>
                  <h3 style={{ color: getContrastingColor(tribeMembers[0]!.startingTribe.color) }}>{tribe}</h3>
                </ColorRow>
              </SelectLabel>
              {tribeMembers
                .map((castaway) => (
                  <SelectItem className='block pr-6 w-full' key={castaway.name} value={castaway.name}>
                    <ColorRow color={castaway.startingTribe.color}>
                      <h3 style={{ color: getContrastingColor(castaway.startingTribe.color) }}>{castaway.name}</h3>
                    </ColorRow>
                  </SelectItem>
                ))}
            </SelectGroup>
          );
        })}
      </SelectContent>
    </Select>
  );
}

interface SelectTribesProps<T extends FieldValues> {
  tribes: Tribe[];
  field: ControllerRenderProps<T, Path<T>>;
}

export function SelectTribes<T extends FieldValues>({ tribes, field }: SelectTribesProps<T>) {
  return (
    <Select onValueChange={field.onChange} {...field}>
      <SelectTrigger className='w-60'>
        <div className='flex-grow text-nowrap'>
          <SelectValue placeholder='Choose your Tribe' />
        </div>
      </SelectTrigger>
      <SelectContent>
        {tribes.map((tribe) => (
          <SelectItem className='block pr-6 w-full' key={tribe.name} value={tribe.name}>
            <ColorRow color={tribe.color}>
              <h3 style={{ color: getContrastingColor(tribe.color) }}>{tribe.name}</h3>
            </ColorRow>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface SelectMembersProps<T extends FieldValues> {
  members: Member[];
  field: ControllerRenderProps<T, Path<T>>;
}

export function SelectMembers<T extends FieldValues>({ members, field }: SelectMembersProps<T>) {
  return (
    <Select onValueChange={field.onChange} {...field}>
      <SelectTrigger className='w-60'>
        <div className='flex-grow text-nowrap'>
          <SelectValue placeholder='Choose your Member' />
        </div>
      </SelectTrigger>
      <SelectContent>
        {members.map((member) => (
          <SelectItem className='block pr-6 w-full' key={member.displayName} value={member.displayName}>
            <ColorRow color={member.color}>
              <h3 style={{ color: getContrastingColor(member.color) }}>{member.displayName}</h3>
            </ColorRow>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
