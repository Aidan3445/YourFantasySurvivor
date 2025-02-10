import type { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
