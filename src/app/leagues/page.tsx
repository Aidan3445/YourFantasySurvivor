import CreateLeagueForm from '~/components/leagues/createLeague';

export default function LeagueCreatePage() {
  return (
    <main className='w-full'>
      <h1 className='text-3xl'>Create a League</h1>
      <CreateLeagueForm />
    </main>
  );
}
