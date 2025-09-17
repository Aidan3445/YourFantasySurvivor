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
            <FormLabel className='text-2xl'>{label}</FormLabel>
          </AccordionTrigger>
          <AccordionContent className='grid gap-y-2'>
            {children}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <div className='grid grid-rows-subgrid row-span-6'>
      <FormLabel className='text-2xl '>{label}</FormLabel>
      {children}
    </div>
  );
}
