'use client';

import { Link } from 'lucide-react';
import { Input } from '../ui/input';
import { useMemo, useState } from 'react';
import { cn } from '~/lib/utils';
import { useLeague } from '~/hooks/useLeague';

export default function InviteLink() {
  const {
    league: {
      leagueHash
    }
  } = useLeague();
  const [hasCopied, setHasCopied] = useState(false);

  const origin = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return window.location.origin;
  }, []);

  const link = `${origin}/leagues/i/${leagueHash}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(link);
    setHasCopied(true);
    alert('Link copied to clipboard');
    setTimeout(() => setHasCopied(false), 1000);
  };

  return (
    <article className='p-2 bg-accent rounded-xl'>
      <h2 className='text-lg font-bold text-accent-foreground'>Invite friends to play</h2>
      <p className='text-sm text-muted-foreground'>Copy the link and share with your friends</p>
      <div
        className='relative flex items-center cursor-pointer'
        onClick={copyLink}>
        <Input
          className={cn('w-full cursor-pointer transition-all', hasCopied && 'bg-white/40')}
          readOnly
          value={link} />
        <Link className='absolute right-4 transition-all' color={hasCopied ? 'gray' : 'black'} />
      </div>
    </article>
  );
}
