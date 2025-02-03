import { type HTMLAttributes } from 'react';
import { cn } from '~/lib/utils';

function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-b4 dark:bg-neutral-800', className)}
      {...props}
    />
  );
}

export { Skeleton };
