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
    setTimeout(() => setHasCopied(false), 5000);
    (document.activeElement as HTMLElement)?.blur();
  };

  return (
    <article className='p-3 bg-card rounded-lg w-full border-2 border-primary/20 shadow-lg shadow-primary/10'>
      <div className='flex items-center gap-2 mb-1'>
        <span className='h-4 w-0.5 bg-primary rounded-full' />
        <h2 className='text-base font-bold uppercase tracking-wider'>Invite Friends</h2>
      </div>
      <p className='text-sm text-muted-foreground mb-2'>Copy the link and share with your friends</p>
      <div
        className='relative flex items-center cursor-pointer group'
        onClick={copyLink}>
        <Input
          className={cn(
            'cursor-pointer pr-10',
            hasCopied && 'border-green-500/40 bg-green-500/10'
          )}
          readOnly
          value={link} />
        <Link className={cn(
          'absolute right-4 w-5 h-5 shrink-0 transition-all',
          hasCopied ? 'text-green-600' : 'text-primary group-hover:text-primary/70'
        )} />
      </div>
    </article>
  );
}
