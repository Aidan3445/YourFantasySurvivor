import { redirect } from 'next/navigation';
import { systemAdminAuth } from '~/lib/auth';
import Import from '~/components/sys/import';

export default async function SystemPage() {
  const { userId } = await systemAdminAuth();
  if (!userId) {
    redirect('/');
  }

  return (
    <main className='w-full p-4'>
      <Import />
    </main>
  );
}

