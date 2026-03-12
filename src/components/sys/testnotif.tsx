'use client';

import { Button } from '~/components/common/button';

export default function TestNotif() {
  return (
    <Button
      variant='outline'
      className='w-full'
      onClick={() => fetch(
        '/api/notifications/test',
        { method: 'POST' }
      ).then(res => res.json()).then(data => console.log(data))}>
      Test Push Notification
    </Button>
  );
}
