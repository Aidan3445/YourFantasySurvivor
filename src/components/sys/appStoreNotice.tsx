'use client';
import { useEffect, useState } from 'react';
import { Button } from '~/components/common/button';

const APP_STORE_URL = 'https://apps.apple.com/app/id6759011635';

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

// Session-level flag so dismissal only lasts until tab/browser is closed
let dismissedThisSession = false;

export function AppStoreInvite() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (dismissedThisSession) return;
    if (!isIOS()) return;
    setShow(true);
  }, []);

  const handleDownload = () => {
    window.open(APP_STORE_URL, '_blank');
    dismissedThisSession = true;
    setShow(false);
  };

  const handleDismiss = () => {
    dismissedThisSession = true;
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-card rounded-xl p-6 max-w-sm mx-4 shadow-xl space-y-4 border-2 border-primary/20'>
        <div className='space-y-1'>
          <h2 className='text-lg font-bold'>Trial by Fire is on the App Store! 🔥</h2>
          <p className='text-muted-foreground text-sm'>
            Get the full mobile experience — live polls and predictions during
            the show, push notifications, and more.
          </p>
        </div>
        <div className='flex flex-col gap-2'>
          <Button onClick={handleDownload} className='w-full'>
            Download on the App Store
          </Button>
          <button
            onClick={handleDismiss}
            className='cursor-pointer text-muted-foreground text-xs text-center hover:text-foreground transition-colors pt-1'>
            Continue on web
          </button>
        </div>
      </div>
    </div>
  );
}
