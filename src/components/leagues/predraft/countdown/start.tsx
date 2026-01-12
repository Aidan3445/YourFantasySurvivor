import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '~/components/common/alertDialog';
import { Button } from '~/components/common/button';
import { Zap, AlertTriangle } from 'lucide-react';

interface StartDraftProps {
  startDraft: () => void;
}

export default function StartDraft({ startDraft }: StartDraftProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant='default'
          size='sm'
          className='font-bold uppercase text-xs tracking-wider shadow-lg hover:shadow-xl transition-all'>
          <Zap className='w-3.5 h-3.5 mr-1 stroke-primary-foreground' />
          Start Now
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className='border-primary/30 shadow-lg shadow-primary/20'>
        <AlertDialogHeader>
          <div className='flex items-center gap-3 mb-2'>
            <div className='h-6 w-1 bg-primary rounded-full' />
            <AlertDialogTitle className='text-2xl font-black uppercase tracking-tight'>
              Start Draft
            </AlertDialogTitle>
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription className='text-base'>
          <span className='flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4'>
            <AlertTriangle className='w-5 h-5 text-yellow-600 shrink-0 mt-0.5' />
            <span>
              <span className='font-bold text-yellow-600 mb-1'>This action is permanent</span>
              <br />
              <span className='text-muted-foreground'>
                Are you sure you want to start the draft now? All league members will be notified.
              </span>
            </span>
          </span>
        </AlertDialogDescription>
        <AlertDialogFooter className='w-full grid grid-cols-2 gap-3'>
          <AlertDialogCancel className='font-bold uppercase text-xs tracking-wider'>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={startDraft}
            className='bg-primary hover:bg-primary/90 font-bold uppercase text-xs tracking-wider shadow-lg hover:shadow-xl transition-all'>
            <Zap className='w-4 h-4 mr-1 stroke-primary-foreground' />
            Start Draft
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
