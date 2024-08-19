'use client';
import { useState } from 'react';

interface ToggleVisibilityProps {
  text: string;
}

export function ToggleVisibility({ text }: ToggleVisibilityProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span className='cursor-pointer' onClick={() => setVisible(!visible)}>
      {visible ? text : '*'.repeat(text.length)}
    </span>
  );
}
