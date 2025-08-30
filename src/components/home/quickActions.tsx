'use client';

import { useState } from 'react';
import { Button } from '../common/button';
import { Card, CardContent, CardHeader, CardTitle } from '../common/card';
import { Input } from '../common/input';
import { Label } from '../common/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../common/dialog';
import CreateLeagueForm from '~/components/leagues/createLeague';
import { Users, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

export function JoinLeagueDialog() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

  const handleJoinLeague = () => {
    if (joinCode.trim()) {
      router.push(`/i/${joinCode.trim()}`);
    }
  };

  return (
    <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' className='w-60'>
          <Users className='mr-2' />
          Join League
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join an Existing League</DialogTitle>
          <DialogDescription>
            Enter the league code or invitation link to join a league.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 pt-4'>
          <div className='space-y-2'>
            <Label htmlFor='league-code'>League Code</Label>
            <Input
              id='league-code'
              placeholder='Enter league code...'
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleJoinLeague();
                }
              }}
            />
          </div>
          <div className='flex gap-2'>
            <Button
              onClick={handleJoinLeague}
              disabled={!joinCode.trim()}
              className='flex-1'
            >
              Join League
            </Button>
            <Button
              variant='outline'
              onClick={() => setIsJoinDialogOpen(false)}
              className='flex-1'
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
