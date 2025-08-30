import { Card, CardContent, CardHeader, CardTitle } from '~/components/common/card';
import { Trophy } from 'lucide-react';

export default function NoActiveLeagues() {
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Trophy className='w-5 h-5 text-yellow-500' />
          Current Leagues
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='text-center py-6'>
          <Trophy className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
          <p className='text-muted-foreground mb-4'>
            No active leagues yet. Create or join one to get started!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
