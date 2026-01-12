import * as React from 'react';

import { cn } from '~/lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[60px] w-full rounded-xl bg-white/70 enabled:hover:bg-accent enabled:focus-within:bg-accent px-3 py-1 text-base shadow-xs transition-colors file:bg-transparent file:text-sm file:font-medium file:text-primary placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-0 focus-visible:ring-ring disabled:opacity-50 md:text-sm',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
