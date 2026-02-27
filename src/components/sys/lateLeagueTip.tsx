'use client';

import { useEffect, useState } from 'react';
import { Button } from '~/components/common/button';
import CreateLeagueModal from '~/components/leagues/actions/league/create/modal';
import { useLeagues } from '~/hooks/user/useLeagues';

const STORAGE_KEY = 'tbf_late_league_tip';
const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // optional

interface LateLeagueTipState {
  visitCount: number;
  dismissed: boolean;
  remindAfter: number | null;
}

function getState(): LateLeagueTipState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as LateLeagueTipState;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return { visitCount: 0, dismissed: false, remindAfter: null };
}

function saveState(state: LateLeagueTipState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function LateLeagueTip() {
  const { data: leagues } = useLeagues();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!leagues) return;

    const state = getState();

    // Permanently dismissed
    if (state.dismissed) return;

    // Cooldown check
    if (state.remindAfter && Date.now() < state.remindAfter) return;

    const hasActiveLeague = leagues.some(
      league => league.league.status === 'Active'
    );

    if (!hasActiveLeague) return;

    const newVisitCount = state.visitCount + 1;
    saveState({ ...state, visitCount: newVisitCount, remindAfter: null });

    // Show on 1st or 2nd visit — tweak if desired
    if (newVisitCount >= 1) {
      setShow(true);
    }
  }, [leagues]);

  const handleDismissForever = () => {
    const state = getState();
    saveState({ ...state, dismissed: true });
    setShow(false);
  };

  const handleRemindLater = () => {
    const state = getState();
    saveState({
      ...state,
      remindAfter: Date.now() + COOLDOWN_MS,
    });
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-card rounded-xl p-6 max-w-sm mx-4 shadow-xl space-y-4 border-2 border-primary/20'>
        <h2 className='text-lg font-bold'>
          It&apos;s not too late to join the fun!
        </h2>

        <p className='text-muted-foreground text-sm'>
          Did you know?
          <br />
          You can still start a league mid-season and play along with everyone else!
        </p>

        <div className='flex flex-col gap-2'>
          <Button
            onClick={handleRemindLater}
            className='w-full text-sm'>
            Remind me later
          </Button>

          <CreateLeagueModal onClose={() => setShow(false)}>
            <Button
              variant='outline'
              className='w-full'>
              Create a League
            </Button>
          </CreateLeagueModal>

          <button
            onClick={handleDismissForever}
            className='cursor-pointer text-muted-foreground text-xs text-center hover:text-foreground transition-colors pt-1'>
            Don&apos;t tell me again
          </button>
        </div>
      </div>
    </div>
  );
}
