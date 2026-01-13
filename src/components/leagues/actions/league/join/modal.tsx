'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { Button } from '~/components/common/button';
import { Input } from '~/components/common/input';
import { Label } from '~/components/common/label';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogCancel } from '~/components/common/alertDialog';
import { useRouter } from 'next/navigation';
import { Users, X, UserPlus } from 'lucide-react';

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
          <Button
            variant='default'
            className='w-80 font-bold uppercase text-sm tracking-wider shadow-lg hover:shadow-xl transition-all'>
            <Users className='w-5 h-5 mr-2 shrink-0' />
            Join League
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className='border-primary/30 shadow-lg shadow-primary/20 animate-scale-in-fast'>
        <AlertDialogHeader>
          <span className='flex items-center gap-3 mb-2'>
            <span className='h-6 w-1 bg-primary rounded-full' />
            <AlertDialogTitle className='text-2xl font-black uppercase tracking-tight'>
              Join League
            </AlertDialogTitle>
          </span>
          <AlertDialogDescription className='text-base'>
            Enter your league code or paste an invitation link to join an existing league.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className='space-y-6 pt-4'>
          <div className='space-y-3'>
            <Label htmlFor='league-code' className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>
              League Code
            </Label>
            <Input
              id='league-code'
              placeholder='Enter code or paste link...'
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleJoinLeague();
                }
              }}
              className='border-2 border-primary/20 focus:border-primary/40 bg-primary/5 font-medium text-lg py-6' />
          </div>

          <div className='flex gap-3'>
            <Button
              onClick={handleJoinLeague}
              disabled={!joinCode.trim()}
              className='flex-1 font-bold uppercase text-xs tracking-wider shadow-lg hover:shadow-xl transition-all'>
              <UserPlus className='w-4 h-4 mr-1.5 shrink-0 stroke-primary-foreground' />
              Join League
            </Button>
            <Button
              variant='outline'
              onClick={() => setIsJoinAlertDialogOpen(false)}
              className='flex-1 font-bold uppercase text-xs tracking-wider border-primary/30 hover:bg-primary/10'>
              Cancel
            </Button>
          </div>
        </div>

        <AlertDialogFooter className='absolute top-4 right-4'>
          <AlertDialogCancel className='h-auto w-auto p-2 bg-destructive/10 border-destructive/30 hover:bg-destructive/20'>
            <X className='w-4 h-4 shrink-0' />
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
