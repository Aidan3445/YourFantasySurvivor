'use client';

import Link from 'next/link';
import { useLeague } from '~/hooks/useLeague';
import { Skeleton } from '../ui/skeleton';
import { Settings, X } from 'lucide-react';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '~/components/ui/alertDialog';
import MemberEditForm from './customization/memberEdit';

export default function LeagueHeader() {
  const {
    league: {
      leagueName,
      season
    }
  } = useLeague();

  return (
    <span className='flex gap-4 w-full px-8 mt-1 items-baseline'>
      {!leagueName ? (
        <Skeleton className='h-8 w-full rounded-md' />
      ) : (<>
        <h1 className='text-2xl font-bold'>{leagueName}</h1>
        <Link href={`https://survivor.fandom.com/wiki/${season}`} target='_blank'>
          <h3 className='text-lg font-semibold text-secondary-foreground hover:underline'>
            {season}
          </h3>
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Settings className='self-center stroke-primary' />
          </AlertDialogTrigger>
          <AlertDialogContent className='w-min'>
            <AlertDialogHeader>
              <AlertDialogTitle hidden>Settings</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription hidden>
              Edit your display name, color.
              <br />
              Admins can also edit the league name.
            </AlertDialogDescription>
            <MemberEditForm />
            <AlertDialogFooter className='absolute top-1 right-1'>
              <AlertDialogCancel className='h-min p-1'>
                <X stroke='white' />
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </>)}
    </span>
  );
}
