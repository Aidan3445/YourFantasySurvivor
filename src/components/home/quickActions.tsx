'use client';

import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { CreateLeagueModal } from '~/components/leagues/createLeague';
import { Plus, Users, Zap } from 'lucide-react';

export function QuickActions() {
  const [joinCode, setJoinCode] = useState('');
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

  const handleJoinLeague = () => {
    if (joinCode.trim()) {
      window.location.href = `/leagues/join/${joinCode.trim()}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Zap className='w-5 h-5 text-blue-500' />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <CreateLeagueModal className='w-full'>
          <Button className='w-full' size='lg'>
            <Plus className='w-4 h-4 mr-2' />
            Create New League
          </Button>
        </CreateLeagueModal>

        <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
          <DialogTrigger asChild>
            <Button variant='outline' className='w-full' size='lg'>
              <Users className='w-4 h-4 mr-2' />
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
      </CardContent>
    </Card>
  );
}
