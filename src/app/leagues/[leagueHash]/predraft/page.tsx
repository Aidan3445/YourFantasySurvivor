import { DraftCountdown } from '~/components/leagues/draftCountdown';
import DraftOrder from '~/components/leagues/draftOrder';
import InviteLink from '~/components/leagues/inviteLink';
import LeagueHeader from '~/components/leagues/leagueHeader';

export default async function LeaguePage() {
  return (
    <main className='flex flex-col gap-0 w-full' >
      <LeagueHeader />
      <div className='grid grid-cols-3 gap-4 w-full h-full p-4'>
        <section className='col-span-2 w-full h-full flex flex-col gap-8 p-4 bg-secondary rounded-3xl border'>
          <InviteLink />
          <DraftCountdown />
          <DraftOrder />
        </section>
        <section className='w-full h-full p-4 bg-secondary rounded-3xl border'>
          <h2 className='text-lg font-bold text-center'>League Chat</h2>
          <div className='flex flex-col gap-2'>YO</div>
        </section>
      </div>
    </main>
  );
}
