'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { Button } from '~/components/common/button';
import { Input } from '~/components/common/input';
import { Label } from '~/components/common/label';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogCancel } from '~/components/common/alertDialog';
import { useRouter } from 'next/navigation';
import { Users, X } from 'lucide-react';

interface JoinLeagueAlertDialogProps {
  children?: ReactNode;
}

export default function JoinLeagueModal({ children }: JoinLeagueAlertDialogProps) {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [isJoinAlertDialogOpen, setIsJoinAlertDialogOpen] = useState(false);

  useEffect(() => {
    // if the join code is in the URL, cut out everything but the code
    // http://localhost:1234/i/-rfJ3Ju9uNAsPBOy --> -rfJ3Ju9uNAsPBOy
    const urlMaybe = joinCode;
    const match = /\/i\/([a-zA-Z0-9-_]+)/.exec(urlMaybe);
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
    <AlertDialog open={isJoinAlertDialogOpen} onOpenChange={setIsJoinAlertDialogOpen}>
      <AlertDialogTrigger asChild>
        {children ?? (
          <Button variant='secondary' className='w-80 text-white'>
            <Users className='mr-2' color='white' />
            Join League
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className='bg-card animate-scale-in-fast'>
        <AlertDialogHeader>
          <AlertDialogTitle>Join an Existing League</AlertDialogTitle>
          <AlertDialogDescription>
            Enter the league code or invitation link to join a league.
          </AlertDialogDescription>
        </AlertDialogHeader>
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
              className='flex-1'>
              Join League
            </Button>
            <Button
              variant='outline'
              onClick={() => setIsJoinAlertDialogOpen(false)}
              className='flex-1'>
              Cancel
            </Button>
          </div>
        </div>
        <AlertDialogFooter className='absolute top-1 right-1'>
          <AlertDialogCancel className='h-min p-1'>
            <X stroke='white' />
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
