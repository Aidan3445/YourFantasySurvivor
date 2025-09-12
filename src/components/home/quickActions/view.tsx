import { Card, CardContent, CardHeader, CardTitle } from '~/components/common/card';
import CreateLeagueForm from '~/components/leagues/actions/league/create/view';
import { Zap } from 'lucide-react';
import JoinLeagueDialog from '~/components/home/quickActions/joinDialogue';

export function QuickActions() {
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='flex justify-center items-center gap-2'>
          <Zap className='w-5 h-5 text-blue-500' />
          Create a new league
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <CreateLeagueForm />
        <h3 className='text-center text-lg font-semibold text-muted-foreground -mt-4'>OR</h3>
        <JoinLeagueDialog />
      </CardContent>
    </Card>
  );
}
