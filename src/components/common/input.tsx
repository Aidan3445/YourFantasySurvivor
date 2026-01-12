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
          'flex h-9 w-full rounded-full bg-white/70 border border-input enabled:hover:bg-accent enabled:focus-within:bg-accent px-3 py-1 text-base shadow-xs transition-colors file:bg-transparent file:text-sm file:font-medium file:text-primary placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-0 focus-visible:ring-ring disabled:opacity-50 md:text-sm',
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
