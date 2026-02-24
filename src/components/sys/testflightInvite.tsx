'use client';
import { useEffect, useState } from 'react';
import { Button } from '~/components/common/button';

const STORAGE_KEY = 'tbf_tf_invite';
const TESTFLIGHT_URL = 'https://testflight.apple.com/join/FzKPB5zn';
const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

interface InviteState {
  visitCount: number;
  dismissed: boolean;
  remindAfter: number | null;
}

function getState(): InviteState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as InviteState;
  } catch {
    // If parsing fails, reset state
    localStorage.removeItem(STORAGE_KEY);
  }
  return { visitCount: 0, dismissed: false, remindAfter: null };
}

function saveState(state: InviteState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // If saving fails, clear state to avoid future issues
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function TestFlightInvite() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const state = getState();

    // Never show again if permanently dismissed
    if (state.dismissed) return;

    // Check cooldown from "remind me later"
    if (state.remindAfter && Date.now() < state.remindAfter) return;

    const newVisitCount = state.visitCount + 1;
    saveState({ ...state, visitCount: newVisitCount, remindAfter: null });

    // Show on 2nd+ visit
    if (newVisitCount >= 2) {
      setShow(true);
    }
  }, []);

  const handleJoin = () => {
    window.open(TESTFLIGHT_URL, '_blank');
    const state = getState();
    saveState({ ...state, dismissed: true });
    setShow(false);
  };

  const handleDismiss = () => {
    const state = getState();
    saveState({ ...state, dismissed: true });
    setShow(false);
  };

  const handleRemindLater = () => {
    const state = getState();
    saveState({ ...state, remindAfter: Date.now() + COOLDOWN_MS });
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-card rounded-xl p-6 max-w-sm mx-4 shadow-xl space-y-4 border-2 border-primary/20'>
        <div className='space-y-1'>
          <h2 className='text-lg font-bold'>Try Trial by Fire on iOS 🔥</h2>
          <p className='text-muted-foreground text-sm'>
            We&apos;re in beta on the App Store — join via TestFlight and get early access to the mobile experience.
          </p>
          <p className='text-muted-foreground text-sm'>
            Including live polls/predictions in the app for events going on in the show. Something to keep connect with other fans live, and you busy during commercials perhaps.
          </p>
        </div>
        <div className='flex flex-col gap-2'>
          <Button onClick={handleJoin} className='w-full'>
            Join the iOS Beta
          </Button>
          <Button onClick={handleRemindLater} variant='outline' className='w-full'>
            Remind Me Later
          </Button>
          <button
            onClick={handleDismiss}
            className='cursor-pointer text-muted-foreground text-xs text-center hover:text-foreground transition-colors pt-1'>
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
