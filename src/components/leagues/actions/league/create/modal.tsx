'use client';

import { type ReactNode, useState } from 'react';
import {
  AlertDialog, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '~/components/common/alertDialog';
import { X } from 'lucide-react';
import CreateLeagueForm from '~/components/leagues/actions/league/create/view';

interface CreateLeagueModalProps {
  children: ReactNode;
  className?: string;
}

export default function CreateLeagueModal({ children, className }: CreateLeagueModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger className={className} asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className='sm:w-160 w-96 flex flex-col'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-2xl'>Create a New League</AlertDialogTitle>
          <AlertDialogDescription className='sr-only'>
            Create a new league to start drafting with your friends.
          </AlertDialogDescription>
          <CreateLeagueForm onSubmit={() => setIsOpen(false)} />
        </AlertDialogHeader>
        <AlertDialogFooter className='absolute top-1 right-1'>
          <AlertDialogCancel className='h-min p-1'>
            <X stroke='white' />
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


