import * as React from 'react';

import { cn } from '~/lib/utils';

const preventDefaultOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
    e.preventDefault();
  }
};

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-lg bg-accent border-2 border-primary/20 enabled:hover:border-primary/30 enabled:focus-within:bg-accent enabled:focus-within:border-primary/40 px-3 py-1 text-base font-medium shadow-sm transition-all file:bg-transparent file:text-sm file:font-medium file:text-primary placeholder:text-muted-foreground placeholder:italic focus-visible:outline-hidden focus-visible:ring-0 disabled:opacity-50 md:text-sm',
          className
        )}
        ref={ref}
        onKeyDown={preventDefaultOnEnter}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input }; 
