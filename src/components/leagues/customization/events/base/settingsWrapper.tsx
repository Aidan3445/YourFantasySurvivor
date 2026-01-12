'use client';

import { type ReactNode } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/common/accordion';
import { FormLabel } from '~/components/common/form';
import { useIsMobile } from '~/hooks/ui/useMobile';

interface SettingsWrapperProps {
  label: string;
  children: ReactNode;
}

export default function SettingsWrapper({ label, children }: SettingsWrapperProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Accordion type='single' collapsible>
        <AccordionItem value={label} className='border-none'>
          <AccordionTrigger className='py-0'>
            <span className='flex items-center gap-2'>
              <span className='h-5 w-0.5 bg-primary rounded-full' />
              <FormLabel className='text-xl font-black uppercase tracking-tight'>{label}</FormLabel>
            </span>
          </AccordionTrigger>
          <AccordionContent className='grid sm:grid-cols-2 gap-2'>
            {children}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <div className='grid grid-rows-subgrid row-span-6 md:grid-cols-2 lg:grid-cols-1 md:gap-2'>
      <span className='flex items-center gap-2 md:col-span-2 lg:col-span-1'>
        <span className='h-5 w-0.5 bg-primary rounded-full' />
        <FormLabel className='text-xl font-black uppercase tracking-tight'>{label}</FormLabel>
      </span>
      {children}
    </div>
  );
}
