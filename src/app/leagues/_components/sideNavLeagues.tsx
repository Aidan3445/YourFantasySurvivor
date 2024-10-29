import { SidebarMenuSub, SidebarMenuSubButton } from '~/app/_components/commonUI/sideBar';
import { getLeagues } from '~/app/api/leagues/query';

export default async function SideNavLeagues() {
  const myLeagues = await getLeagues();

  if (myLeagues.length === 0) {
    return null;
  }

  return (
    <SidebarMenuSub className='ml-[18px]'>
      {myLeagues.map((league) => (
        <SidebarMenuSubButton
          key={league.id}
          className='text-nowrap'
          href={`/leagues/${league.id}`}>
          {league.name}
        </SidebarMenuSubButton>
      ))}
    </SidebarMenuSub>
  );
}
