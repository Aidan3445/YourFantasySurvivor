'use client';

import { useEffect, useState } from 'react';
import { Button } from '~/components/common/button';
import { Input } from '~/components/common/input';
import { Label } from '~/components/common/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/common/dialog';
import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';

export default function JoinLeagueDialog() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

  useEffect(() => {
    // if the join code is in the URL, cut out everything but the code
    // http://localhost:1234/i/-rfJ3Ju9uNAsPBOy --> -rfJ3Ju9uNAsPBOy
    const urlMaybe = joinCode;
    const match = urlMaybe.match(/\/i\/([a-zA-Z0-9-_]+)/);
    if (match) {
      setJoinCode(match[1] ?? joinCode);
    }
  }, [joinCode]);

  const handleJoinLeague = () => {
    if (joinCode.trim()) {
      router.push(`/i/${joinCode.trim()}`);
    }
  };

  return (
    <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
      <DialogTrigger asChild>
        <Button variant='secondary' className='w-80 text-white'>
          <Users className='mr-2' color='white' />
          Join League
        </Button>
      </DialogTrigger>
      <DialogContent className='bg-card'>
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
