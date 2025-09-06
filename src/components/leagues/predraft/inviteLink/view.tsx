'use client';

import { Link } from 'lucide-react';
import { Input } from '~/components/common/input';
import { useMemo, useState } from 'react';
import { cn } from '~/lib/utils';
import { useLeague } from '~/hooks/leagues/useLeague';

export default function InviteLink() {
  const { data: league } = useLeague();

  const [hasCopied, setHasCopied] = useState(false);

  const origin = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return window.location.origin;
  }, []);

  if (!league) return null;

  const link = `${origin}/i/${league.hash}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(link);
    setHasCopied(true);
    alert('Link copied to clipboard');
    setTimeout(() => setHasCopied(false), 1000);
  };

  return (
    <article className='p-2 bg-card rounded-xl w-full'>
      <h2 className='text-lg font-bold text-card-foreground'>Invite friends to play</h2>
      <p className='text-sm text-muted-foreground'>Copy the link and share with your friends</p>
      <div
        className='relative flex items-center cursor-pointer'
        onClick={copyLink}>
        <Input
          className={cn('w-full cursor-pointer transition-all pr-10', hasCopied && 'bg-white/40')}
          readOnly
          value={link} />
        <Link className='absolute right-4 transition-all' color={hasCopied ? 'gray' : 'black'} />
      </div>
    </article>
  );
}
