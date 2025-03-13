import { Eye } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger
} from '~/components/ui/alertDialog';
import { type LeagueMemberDisplayName } from '~/server/db/defs/leagueMembers';

interface MemberPredictionsProps {
  member: LeagueMemberDisplayName;
  iconColor: string;
}

export default function MemberPredictions({ member, iconColor }: MemberPredictionsProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Eye size={18} color={iconColor} />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {`${member}'s Predictions`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            This feature is not yet available.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
