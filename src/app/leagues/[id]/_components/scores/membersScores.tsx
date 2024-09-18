import { getContrastingColor } from '@uiw/color-convert';
import EditMember, { InviteMember, ManageMember, RoleHover } from './memberEdit';
import { cn, type ComponentProps } from '~/lib/utils';
import { type Member } from '~/server/db/schema/members';
import { Separator } from '~/app/_components/commonUI/separator';

interface MembersProps {
  leagueId: number;
  members: (Member & { points: number })[];
  ownerLoggedIn: boolean;
  isFull: boolean;
}

export default async function Members({ leagueId, members, ownerLoggedIn, isFull }: MembersProps) {
  const showPointsPlace = members.some((m) => m.points > 0);
  const showDrafted = members.some((m) => m.drafted);

  return (
    <table className='space-x-1 space-y-2'>
      <HeaderRow showPointsPlace={showPointsPlace} showDrafted={showDrafted} />
      <tbody>
        {members.map((member, index) => {
          const cColor = getContrastingColor(member.color);
          return (
            <tr key={member.id}>
              {showPointsPlace &&
                <td>
                  <ColorRow color={member.color} className='py-1 text-xs col-start-1 flex justify-center'>
                    <h3 style={{ color: cColor }}>{index + 1}</h3>
                  </ColorRow>
                </td>}
              {showPointsPlace &&
                <td>
                  <ColorRow color={member.color} className='py-1 text-xs col-start-2 flex justify-center'>
                    <h3 style={{ color: cColor }}>{member.points}</h3>
                  </ColorRow>
                </td>}
              <td>
                <ColorRow className={cn('col-start-3', member.drafted ? '' : 'col-span-2')} color={member.color} loggedIn={member.loggedIn} >
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
              {member.drafted &&
                <td>
                  <ColorRow color={member.color} className='py-1 text-xs col-start-4 flex justify-center'>
                    <h3 style={{ color: cColor }}>{member.drafted}</h3>
                  </ColorRow>
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
    </table>
  );
}

interface ColorRowProps extends ComponentProps {
  color: string;
  loggedIn?: boolean;
}

export function ColorRow({ children, className, color, loggedIn }: ColorRowProps) {
  return (
    <div
      className={cn(
        'px-2 gap-1 rounded border border-black flex items-center text-nowrap transition-all duration-500',
        loggedIn && 'border ring-2 ring-white',
        className)}
      style={{ background: color }}>
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
