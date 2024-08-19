import { getContrastingColor } from '@uiw/color-convert';
import EditMember, { InviteMember, ManageMember, RoleHover } from './memberEdit';
import { cn } from '~/lib/utils';
import { type Member } from '~/app/api/leagues/query';
import { type ReactNode } from 'react';
import { Separator } from '~/app/_components/commonUI/separator';

interface MembersProps {
  leagueId: number;
  members: Member[];
  ownerLoggedIn: boolean;
  isFull: boolean;
}

export default function Members({ leagueId, members, ownerLoggedIn, isFull }: MembersProps) {
  return (
    <div className='flex flex-col gap-1'>
      {members.map((member) => {
        const cColor = getContrastingColor(member.color);
        return (
          <MemberRow key={member.displayName} color={member.color} loggedIn={member.loggedIn}>
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
          </MemberRow>
        );
      })}
      {!isFull &&
        <div>
          <Separator className='col-span-3 my-1 w-full' decorative />
          <InviteMember leagueId={leagueId} />
        </div>}
    </div>
  );
}

interface MemberRowProps {
  children: ReactNode;
  color: string;
  loggedIn: boolean;
}

export function MemberRow({ children, color, loggedIn }: MemberRowProps) {
  return (
    <div
      className={cn('px-2 gap-1 rounded border border-black flex items-center', loggedIn && 'border ring ring-white')}
      style={{ background: color }}>
      {children}
    </div>
  );
}
