'use client';
import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '~/lib/utils';

interface PopoverProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root> {
  hover?: boolean;
  hoverDelay?: number;
  hoverOpenDelay?: number;
}

const Popover = ({ hover, hoverDelay = 200, hoverOpenDelay = 300, ...props }: PopoverProps) => {
  const [tapped, setTapped] = React.useState(props.defaultOpen ?? false);
  const [isHovering, setIsHovering] = React.useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const openTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hover) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      if (hoverOpenDelay > 0) {
        openTimeoutRef.current = setTimeout(() => {
          setIsHovering(true);
        }, hoverOpenDelay);
      } else {
        setIsHovering(true);
      }
    }
  };

  const handleMouseLeave = () => {
    if (hover) {
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
      }

      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovering(false);
      }, hoverDelay);
    }
  };

  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
      }
    };
  }, []);

  return (
    <PopoverPrimitive.Root
      open={hover ? isHovering || tapped : props.open}
      onOpenChange={open => {
        if (hover) {
          if (!open) {
            setIsHovering(false);
            setTapped(false);
          }
        } else {
          props.onOpenChange?.(open);
        }
      }}
    >
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          if (hover) {
            setTapped(!tapped);
          }
        }}
        className='flex'
      >
        {props.children}
      </div>
    </PopoverPrimitive.Root>
  );
};

const PopoverTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Trigger
    ref={ref}
    className={cn('cursor-pointer', className)}
    {...props}
  />
));
PopoverTrigger.displayName = PopoverPrimitive.Trigger.displayName;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'relative z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
