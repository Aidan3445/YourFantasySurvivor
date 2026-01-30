'use client';

import { useFloatingActionWidget } from '~/hooks/ui/useFloatingActionWidget';

export default function Spacer() {
  const { isVisible } = useFloatingActionWidget();

  if (isVisible) {
    return <div className='h-16' />;
  }
  return null;
}
