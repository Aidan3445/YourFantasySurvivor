import type { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type ReactNode } from 'react';
import { cn } from '~/lib/utils';

interface SortableItemProps {
  disabled?: boolean;
  id: UniqueIdentifier;
  className?: string;
  children: ReactNode;
}

export default function SortableItem({ id, disabled, className, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className={cn(className, 'hover:z-50', disabled ? 'pointer-events-none' : 'pointer-events-auto')}
      ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
