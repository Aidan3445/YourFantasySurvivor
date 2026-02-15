'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '~/components/common/button';

export function RebrandNotice() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get('from') === 'yfs') {
      setShow(true);
      // Clean the URL
      const url = new URL(window.location.href);
      url.searchParams.delete('from');
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router]);

  if (!show) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 '>
      <div className='bg-card rounded-xl p-6 max-w-sm mx-4 shadow-xl space-y-4 border-2 border-primary/20'>
        <h2 className='text-lg font-bold'>We&apos;ve got a new name!</h2>
        <p className='text-muted-foreground text-sm'>
          Your Fantasy Survivor is now <span className='font-semibold text-primary'>Trial by Fire</span>.
          <br />
          Same game, fresh look.
        </p>
        <Button onClick={() => setShow(false)} className='w-full'>
          Got it
        </Button>
      </div>
    </div>
  );
}
