import { redirect } from 'next/navigation';
import { systemAdminAuth } from '~/lib/auth';
import Import from '~/components/sys/import';
import { Button } from '~/components/common/button';
import { resetServersideCache } from '~/services/seasons/reset';

export default async function SystemPage() {
  const { userId } = await systemAdminAuth();
  if (!userId) {
    redirect('/');
  }

  return (
    <main className='w-full p-4'>
      <Import />
      <Button
        onClick={async () => {
          'use server';
          // Call server action to reset cache
          await resetServersideCache();
        }}
      >
        Reset Cache
      </Button>
    </main>
  );
}

