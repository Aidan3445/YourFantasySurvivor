import { QUERIES } from '~/app/api/leagues/query';
import { DraftCountdown } from '~/components/leagues/draftCountdown';
import InviteLink from '~/components/leagues/inviteLink';
import { type LeaguePageProps } from '../page';
import { redirect } from 'next/navigation';

export default async function LeaguePage({ params }: LeaguePageProps) {
  const { leagueHash } = await params;

  const leagueResponse = await QUERIES.getLeague(leagueHash);
  if (!leagueResponse) redirect('/leagues');

  const { league: { leagueName } } = leagueResponse;

  return (
    <main className='flex flex-col gap-0 w-full' >
      <h1 className='text-2xl font-bold'>{leagueName}</h1>
      <div className='grid grid-cols-3 gap-4 w-full h-full p-4'>
        <section className='col-span-2 w-full h-full flex flex-col gap-8 p-4 bg-secondary rounded-3xl border'>
          <InviteLink leagueHash={leagueHash} />
          <DraftCountdown />
        </section>
        <section className='w-full h-full p-4 bg-secondary rounded-3xl border'>
          <h2 className='text-lg font-bold text-center'>League Chat</h2>
          <div className='flex flex-col gap-2'>YO</div>
        </section>
      </div>
    </main>
  );
}
