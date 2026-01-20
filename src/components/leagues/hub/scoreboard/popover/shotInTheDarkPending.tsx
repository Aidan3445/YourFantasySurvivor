import { PopoverArrow } from '@radix-ui/react-popover';
import { Dices } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { Separator } from '~/components/common/separator';
import { cn } from '~/lib/utils';

interface ShotInTheDarkPendingProps {
  loggedIn: boolean;
}

export default function ShotInTheDarkPending({ loggedIn }: ShotInTheDarkPendingProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Dices className={cn(
          'w-5 h-5 cursor-pointer hover:stroke-primary/70 transition-colors',
          loggedIn && 'stroke-primary'
        )} />
      </PopoverTrigger>
      <PopoverContent className='border-2 border-primary/30 shadow-lg shadow-primary/20 bg-card p-3'>
        <PopoverArrow className='fill-primary' />
        <div className='text-sm font-bold uppercase tracking-wider text-center'>Shot in the Dark Active</div>
        <Separator className='my-2 bg-primary/20' />
        <p className='text-xs text-muted-foreground'>
          {loggedIn ? 'You have' : 'This member has'} activated Shot in the Dark
          for the upcoming episode to protect their survival streak.
        </p>
      </PopoverContent>
    </Popover>
  );
}

