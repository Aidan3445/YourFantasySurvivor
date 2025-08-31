import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '~/components/common/alertDialog';
import { Button } from '~/components/common/button';

interface StartDraftProps {
  startDraft: () => void;
}

export default function StartDraft({ startDraft }: StartDraftProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant='positive'>Start Draft</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Start Draft</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          Are you sure you want to start the draft now?
          <br />
          This action cannot be undone.
        </AlertDialogDescription>
        <AlertDialogFooter className='w-full grid grid-cols-2'>
          <AlertDialogAction onClick={startDraft}>Start Draft</AlertDialogAction>
          <AlertDialogCancel>Not Yet</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
