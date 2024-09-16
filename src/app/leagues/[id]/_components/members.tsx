import { getContrastingColor } from '@uiw/color-convert';
import EditMember, { InviteMember, ManageMember, RoleHover } from './memberEdit';
import { cn, type ComponentProps } from '~/lib/utils';
import { type Member } from '~/server/db/schema/members';
import { Separator } from '~/app/_components/commonUI/separator';

interface MembersProps {
  leagueId: number;
  members: Member[];
  ownerLoggedIn: boolean;
  isFull: boolean;
}

export default function Members({ leagueId, members, ownerLoggedIn, isFull }: MembersProps) {
  return (
    <div className='grid gap-1 auto-cols-min'>
      {members.map((member) => {
        const cColor = getContrastingColor(member.color);
        return (
          <>
            < ColorRow className='w-full' color={member.color} loggedIn={member.loggedIn} >
              <h3
                className='font-medium'
                style={{ color: cColor }}>
                {member.displayName}
              </h3>
              {
                member.loggedIn &&
                <EditMember color={cColor} leagueId={leagueId} isOwner={member.isOwner} />
              }
              {
                ownerLoggedIn && !member.loggedIn &&
                <ManageMember color={cColor} leagueId={leagueId} member={member} />
              }
              <RoleHover
                isAdmin={member.isAdmin}
                isOwner={member.isOwner}
                color={cColor} />
            </ColorRow>
            {member.drafted ?
              <ColorRow color={member.color} className='text-xs py-1'>
                <h3 style={{ color: cColor }}>{member.drafted}</h3>
              </ColorRow> :
              <br />}
          </>
        );
      })}
      {
        !isFull &&
        <div className='col-span-2'>
          <Separator className='my-1 w-full' decorative />
          <InviteMember leagueId={leagueId} />
        </div>
      }
    </div >
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
