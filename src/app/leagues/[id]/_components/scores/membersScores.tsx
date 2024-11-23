'use client';
import { getContrastingColor } from '@uiw/color-convert';
import EditMember, { ChangeSurvivor, InviteMember, ManageMember, RoleHover } from './memberEdit';
import { cn, getCurrentTribe, getTribeGradient, type ComponentProps } from '~/lib/utils';
import { type Member } from '~/server/db/schema/members';
import { Separator } from '~/app/_components/commonUI/separator';
import { type CastawayDetails } from '~/server/db/schema/castaways';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '~/app/_components/commonUI/hover';
import { ChevronRight, Skull } from 'lucide-react';
import { mouseOutLeaderboard, mouseOverLeaderboard } from '~/app/playground/_components/leaderboard';
import { useMemo } from 'react';
import { Skeleton } from '~/app/_components/commonUI/skeleton';

interface MembersProps {
  leagueId: number;
  members: (Member & { points: number })[];
  details: {
    remaining: CastawayDetails[];
    unavailable: CastawayDetails[];
    castaways: CastawayDetails[];
  };
  ownerLoggedIn: boolean;
  isFull: boolean;
}

export default function Members({ leagueId, members, ownerLoggedIn, isFull, details }: MembersProps) {
  const showPointsPlace = members.some((m) => m.points > 0);
  const showDrafted = members.some((m) => m.drafted);

  const memberDisplayNames = members.map((m) => m.displayName);

  const preventChange = useMemo(() => members
    .filter((m) => !m.loggedIn)
    .some((m) => !details.remaining
      .some((r) => r.more.shortName === m.drafted.slice(-1)[0])), [members, details.remaining]);

  return (
    <table className='space-x-1 space-y-2 h-min'>
      <HeaderRow showPointsPlace={showPointsPlace} showDrafted={showDrafted} />
      <tbody>
        {members.map((member, index) => {
          const currentPick = member.drafted.slice(-1)[0];
          const cColor = getContrastingColor(member.color);
          const sColor = getCurrentTribe(details.remaining
            .find((c) => c.more.shortName === currentPick))?.color
            ?? '#AAAAAA';
          const csColor = getContrastingColor(sColor);
          return (
            <tr
              key={member.id}
              className='cursor-default'
              onMouseOver={() => mouseOverLeaderboard(member.displayName, memberDisplayNames)}
              onMouseOut={() => mouseOutLeaderboard(member.displayName, member.color, memberDisplayNames)}>
              {showPointsPlace &&
                <td>
                  <ColorRow color={member.color} className='py-1 text-xs flex justify-center'>
                    <h3 style={{ color: cColor }}>{index + 1}</h3>
                  </ColorRow>
                </td>}
              {showPointsPlace &&
                <td>
                  <ColorRow color={member.color} className='py-1 text-xs flex justify-center'>
                    <h3 style={{ color: cColor }}>{member.points}</h3>
                  </ColorRow>
                </td>}
              <td>
                <ColorRow color={member.color} loggedIn={member.loggedIn} >
                  <h3
                    className='font-medium'
                    style={{ color: cColor }}>
                    {member.displayName}
                  </h3>
                  {member.loggedIn &&
                    <EditMember color={cColor} leagueId={leagueId} isOwner={member.isOwner} />}
                  {ownerLoggedIn && !member.loggedIn &&
                    <ManageMember color={cColor} leagueId={leagueId} member={member} />}
                  <RoleHover
                    isAdmin={member.isAdmin}
                    isOwner={member.isOwner}
                    color={cColor} />
                </ColorRow>
              </td>
              {!!member.drafted.length &&
                <td>
                  <HoverCard>
                    <HoverCardTrigger>
                      <ColorRow color={sColor} gradient className='py-1 text-xs flex gap-2' >
                        <h3 className='flex justify-between w-full' style={{ color: csColor }}>{currentPick}
                          <span className='flex'>
                            {details.castaways.find((c) => c.more.shortName === currentPick)?.tribes
                              .map((t) => (<ChevronRight key={t.name} strokeWidth={5} size={16} color={t.color} />))}
                          </span>
                        </h3>
                        {member.loggedIn && (members.length < details.remaining.length ||
                          currentPick === undefined) &&
                          (
                            <ChangeSurvivor
                              preventChange={preventChange}
                              className='ml-auto'
                              leagueId={leagueId}
                              color={csColor}
                              castaways={details.remaining}
                              otherChoices={details.unavailable}
                              currentPick={currentPick} />
                          )}
                      </ColorRow>
                    </HoverCardTrigger>
                    <HoverCardContent className='w-min p-1 grid gap-1' side='right'>
                      {member.drafted.map((d, i) => {
                        const castaway = details.castaways.find((c) => c.more.shortName === d);
                        const dColor = getCurrentTribe(castaway)?.color ?? '#AAAAAA';
                        const cdColor = getContrastingColor(dColor);
                        const eliminated = !details.remaining.some((c) => c.more.shortName === d);
                        return (
                          <a key={i} href={`/seasons/castaway?season=${castaway?.more.season}&castaway=${d}`}>
                            <ColorRow
                              color={dColor}
                              className='py-1 text-xs flex justify-center cursor-pointer'>
                              <h3 style={{ color: cdColor }}>
                                {d}
                              </h3>
                              {eliminated && <Skull className='inline' size={16} color={cdColor} />}
                            </ColorRow>
                          </a>
                        );
                      })}
                    </HoverCardContent>
                  </HoverCard>
                </td>}
            </tr>
          );
        })}
      </tbody>
      {
        !isFull &&
        <div className='col-span-2'>
          <Separator className='my-1 w-full' decorative />
          <InviteMember leagueId={leagueId} />
        </div>
      }
    </table >
  );
}

export interface ColorRowProps extends ComponentProps {
  color: string;
  gradient?: boolean;
  loggedIn?: boolean;
}

export function ColorRow({ children, className, color, gradient, loggedIn }: ColorRowProps) {
  return (
    <div
      className={cn(
        'px-2 gap-1 rounded border border-black flex items-center text-nowrap transition-all duration-500',
        loggedIn && 'border ring-2 ring-white',
        className)}
      style={gradient ? { backgroundImage: `linear-gradient(90deg, ${color} 70%, white  100%)` } :
        { backgroundColor: color }}>
      {children}
    </div>
  );
}

interface HeaderRowProps {
  showPointsPlace?: boolean;
  showDrafted?: boolean;
}

function HeaderRow({ showPointsPlace, showDrafted }: HeaderRowProps) {
  return (
    <thead>
      <tr>
        {showPointsPlace &&
          <th>
            <ColorRow key='header-pl' color={'white'} className='py-1 text-xs col-start-1 flex justify-center'>
              <h3>Place</h3>
            </ColorRow>
          </th>}
        {showPointsPlace &&
          <th>
            <ColorRow key='header-po' color={'white'} className='py-1 text-xs col-start-2 flex justify-center'>
              <h3>Points</h3>
            </ColorRow>
          </th>}
        <th>
          <ColorRow key='header-m' className={cn('py-1 text-xs col-start-3 flex justify-center', showDrafted ? '' : 'col-span-2')} color={'white'}>
            <h3>Member</h3>
          </ColorRow >
        </th>
        {showDrafted &&
          <th>
            <ColorRow key='header-d' color={'white'} className='py-1 text-xs col-start-4 flex justify-center'>
              <h3>Survivor</h3>
            </ColorRow>
          </th>}
      </tr>
    </thead>
  );
}

export function MembersSkeleton() {
  return (
    <table className='h-min space-x-1 space-y-2'>
      <HeaderRow showPointsPlace showDrafted />
      <tbody>
        {Array.from({ length: 9 }).map((_, index) => (
          <tr key={index}>
            <td>
              <Skeleton className='min-w-8 h-[26px]' />
            </td>
            <td>
              <Skeleton className='min-w-8 h-[26px]' />
            </td>
            <td>
              <Skeleton className='min-w-24 h-[26px]' />
            </td>
            <td>
              <Skeleton className='min-w-8 h-[26px]' />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
