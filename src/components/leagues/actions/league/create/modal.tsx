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
  onClose?: () => void;
}

export default function CreateLeagueModal({ children, className, onClose }: CreateLeagueModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && onClose) onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger className={className} asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className='sm:w-160 w-96 flex flex-col animate-scale-in-fast border-primary/30 shadow-lg shadow-primary/20'>
        <AlertDialogHeader>
          <span className='flex items-center gap-3 mb-2'>
            <span className='h-6 w-1 bg-primary rounded-full' />
            <AlertDialogTitle className='text-2xl font-black uppercase tracking-tight'>
              Create League
            </AlertDialogTitle>
          </span>
          <AlertDialogDescription className='sr-only'>
            Create a new league to start drafting with your friends.
          </AlertDialogDescription>
          <CreateLeagueForm onSubmit={() => setIsOpen(false)} />
        </AlertDialogHeader>
        <AlertDialogFooter className='absolute top-4 right-4'>
          <AlertDialogCancel className='h-auto w-auto p-2 bg-destructive/10 border-destructive/30 hover:bg-destructive/20'>
            <X className='w-4 h-4 shrink-0' />
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


