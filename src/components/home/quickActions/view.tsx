import { Card, CardContent, CardHeader, CardTitle } from '~/components/common/card';
import CreateLeagueForm from '~/components/leagues/actions/league/create/view';
import { Zap } from 'lucide-react';
import JoinLeagueModal from '~/components/home/quickActions/joinDialogue';

export function QuickActions() {
  return (
    <Card className='h-auto mb-0'>
      <CardHeader>
        <CardTitle className='flex justify-center items-center gap-2'>
          <Zap className='w-5 h-5 text-blue-500' />
          Create a new league
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <CreateLeagueForm />
        <h3 className='text-center text-lg font-semibold text-muted-foreground'>OR</h3>
        <JoinLeagueModal />
      </CardContent>
    </Card>
  );
}
