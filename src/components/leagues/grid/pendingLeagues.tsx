import { Hourglass } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '~/components/common/alertDialog';
import { Button } from '~/components/common/button';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { cn } from '~/lib/utils';
import { type PublicLeague } from '~/types/leagues';

interface PendingLeaguesProps {
  pendingLeagues: PublicLeague[];
  className?: string;
}

export default function PendingLeagues({ pendingLeagues, className }: PendingLeaguesProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button className={cn(
          'flex gap-2 items-center px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all cursor-pointer',
          className
        )}>
          <Hourglass size={18} className='stroke-primary-foreground shrink-0' />
          <h3 className='text-sm font-bold uppercase tracking-wider text-primary-foreground'>
            Pending Leagues
          </h3>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        className='sm:w-160 w-96 flex flex-col animate-scale-in-fast'>
        <AlertDialogHeader>
          <span className='flex items-center gap-3 mb-2'>
            <span className='h-6 w-1 bg-primary rounded-full' />
            <AlertDialogTitle className='text-2xl font-black uppercase tracking-tight'>
              Pending Leagues
            </AlertDialogTitle>
          </span>
          <AlertDialogDescription className='text-base text-left'>
            These are leagues you have requested to join.
            Please wait for the league owner to approve your request.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ScrollArea className='h-40'>
          <div className={cn('space-y-2', pendingLeagues.length > 3 && 'pr-4')}>
            {pendingLeagues.length > 0 ? (
              pendingLeagues.map((league) => (
                <div
                  key={league.hash}
                  className='p-3 border border-primary/20 rounded-lg bg-primary/5'>
                  <h3 className='text-lg font-bold'>{league.name}</h3>
                </div>
              ))
            ) : (
              <p className='text-sm text-muted-foreground'>You have no pending league requests.</p>
            )}
          </div>
          <ScrollBar forceMount />
        </ScrollArea>
        <AlertDialogFooter>
          <AlertDialogCancel variant='secondary'>
            Close
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
