'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '~/lib/utils';

const Tabs = TabsPrimitive.Root;

const DynamicTabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & {
    rules: {
      tabName: string;
      minWidth?: string;
      maxWidth?: string;
    }[]
  }
>(({ rules, defaultValue, className, ...props }, ref) => {
  const [displayArray, setDisplayArray] = React.useState<boolean[]>(rules.map(() => false));
  const [tab, setTab] = React.useState<string | undefined>(defaultValue);

  React.useEffect(() => {
    const checkScreen = () => {
      const newDisplayArray = rules.map((rule) => {
        const maxCheck = rule.maxWidth ? window.innerWidth <= parseInt(rule.maxWidth) : true;
        const minCheck = rule.minWidth ? window.innerWidth >= parseInt(rule.minWidth) : true;
        return maxCheck && minCheck;
      });
      setDisplayArray(newDisplayArray);
    };

    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => {
      window.removeEventListener('resize', checkScreen);
    };
  }, [rules]);

  React.useEffect(() => {
    const activeTabRuleIndex = rules.findIndex((rule) => tab === rule.tabName);
    const activeTabDisplay = displayArray[activeTabRuleIndex];

    if (activeTabDisplay === undefined) return;
    if (!activeTabDisplay) {
      setTab(defaultValue);
    }
  }, [displayArray, defaultValue, rules, tab]);

  return (
    <TabsPrimitive.Root
      ref={ref}
      className={cn('w-full', className)}
      defaultValue={defaultValue}
      value={tab}
      onValueChange={setTab}
      {...props}
    />
  );
});
DynamicTabs.displayName = TabsPrimitive.Root.displayName;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-12 items-center gap-1 justify-center rounded-md bg-primary/5 p-1 shadow-lg shadow-primary/20 border-t-2 border-primary/20',
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-xs font-bold uppercase tracking-wider ring-offset-background bg-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 enabled:data-[state=inactive]:hover:-translate-y-0.5 enabled:data-[state=inactive]:hover:bg-primary/20 enabled:data-[state=inactive]:hover:shadow-md enabled:data-[state=inactive]:hover:shadow-primary/20 hover:duration-300 focus-visible:outline-hidden focus-visible:ring-0 cursor-pointer',
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'flex flex-col items-center mt-2 ring-offset-background focus-visible:outline-hidden focus-visible:ring-0',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, DynamicTabs, TabsList, TabsTrigger, TabsContent };

