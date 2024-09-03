import type { UniqueIdentifier, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type SetStateAction } from 'react';
import { cn, type ComponentProps } from '~/lib/utils';

interface SortableItemProps extends ComponentProps {
  id: UniqueIdentifier;
  disabled?: boolean;
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

export function handleDragEnd<T>(
  event: DragEndEvent,
  setItems: (items: SetStateAction<(T & { id: UniqueIdentifier })[]>) => void) {
  const { active, over } = event;

  if (over && active.id !== over.id) {
    setItems((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      return arrayMove(items, oldIndex, newIndex).map((item, index) => ({ ...item, index }));
    });
  }
}
