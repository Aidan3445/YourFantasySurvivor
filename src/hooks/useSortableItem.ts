import type { UniqueIdentifier, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { type SetStateAction } from 'react';

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

