import { Suspense } from 'react';
import AutoJoin from './_components/autoJoin';

export default async function JoinPage() {
  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <AutoJoin />
      </Suspense>
    </main>
  );
}
