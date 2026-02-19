'use client';

import { type ReactNode, useState } from 'react';
import {
  AlertDialog, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '~/components/common/alertDialog';
import { X } from 'lucide-react';
import TutorialCarousel from '~/components/shared/tutorial/carousel';

interface TutorialModalProps {
  children: ReactNode;
  className?: string;
  showCustomization?: boolean;
}

export default function TutorialModal({ children, className, showCustomization }: TutorialModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger className={className} asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className='sm:w-160 px-0 w-96 flex flex-col animate-scale-in-fast border-primary/30 shadow-lg shadow-primary/20'>
        <AlertDialogHeader>
          <span className='flex items-center gap-3 mb-2 px-4'>
            <span className='h-6 w-1 bg-primary rounded-full' />
            <AlertDialogTitle className='text-2xl font-black uppercase tracking-tight'>
              How to Play
            </AlertDialogTitle>
          </span>
          <AlertDialogDescription className='sr-only'>
            Learn how Trial by Fire fantasy scoring works.
          </AlertDialogDescription>
          <TutorialCarousel onComplete={() => setIsOpen(false)} showCustomization={showCustomization} />
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
