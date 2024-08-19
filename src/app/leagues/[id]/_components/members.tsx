import { HoverCardArrow } from '@radix-ui/react-hover-card';
import { Crown, Shield } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '~/app/_components/commonUI/hover';
import { getContrastingColor } from '@uiw/color-convert';
import EditMember, { ManageMember } from './memberEdit';
import { cn } from '~/lib/utils';
import { type Member } from '~/app/api/leagues/query';

interface MembersProps {
  leagueId: number;
  members: Member[];
  ownerLoggedIn: boolean;
}

export default function Members({ leagueId, members, ownerLoggedIn }: MembersProps) {
  return (
    <div className='flex flex-col gap-1'>
      {members.map((member) => {
        const cColor = getContrastingColor(member.color);
        return (
          <div
            key={member.displayName}
            className={cn('px-2 gap-1 rounded border border-black flex items-center', member.loggedIn && 'border ring ring-white')}
            style={{ background: member.color }}>
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
          </div>
        );
      })}
    </div >
  );
}



interface RoleHoverProps {
  isAdmin: boolean;
  isOwner: boolean;
  color: string;
}

function RoleHover({ isAdmin, isOwner, color }: RoleHoverProps) {
  return (
    <div className='ml-auto pl-3'>
      {isOwner &&
        <HoverCard openDelay={200}>
          <HoverCardTrigger>
            <Crown size={16} color={color} fill={color} />
          </HoverCardTrigger>
          <HoverCardContent className='text-xs p-0.5 w-min text-center border-black shadow-md bg-b2 shadow-zinc-700' sideOffset={10} side='top'>
            <HoverCardArrow className='absolute -translate-x-1' />
            <p className='text-nowrap'>League Owner</p>
          </HoverCardContent>
        </HoverCard>}
      {isAdmin && !isOwner &&
        <HoverCard openDelay={200}>
          <HoverCardTrigger>
            <Shield size={16} color={color} fill={color} />
          </HoverCardTrigger>
          <HoverCardContent className='text-xs p-0.5 w-min text-center border-black shadow-md bg-b2 shadow-zinc-700' sideOffset={10} side='top'>
            <HoverCardArrow className='absolute -translate-x-1' />
            <p className='text-nowrap'>League Admin</p>
          </HoverCardContent>
        </HoverCard>}
    </div>
  );
}
