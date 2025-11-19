import { HelpCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { PopoverArrow } from '@radix-ui/react-popover';

export default function PredictionTimingHelp() {
  return (
    <Popover modal hover>
      <PopoverTrigger>
        <HelpCircle size={12} className='inline-block' />
      </PopoverTrigger>
      <PopoverContent className='w-80 md:w-full'>
        <PopoverArrow />
        <h3 className='text-lg font-semibold'>Prediction Timing</h3>
        <p className='text-sm'>
          Prediction timing determines when players make their predictions. Predictions can be set at various points in the season:
        </p>
        <ScrollArea className='max-h-40'>
          <ul className='list-disc pl-4 text-sm'>
            <li><b>Draft</b> – Predictions are locked in when players draft their teams, before the league starts.</li>
            <li><b>Weekly</b> – Predictions are made each week. Can apply to:
              <ul className='list-[revert] pl-4'>
                <li><b className='font-semibold'>Full Season</b> – Every week from premiere to finale.</li>
                <li><b className='font-semibold'>Pre-Merge Only</b> – Weekly predictions end once the tribes merge.</li>
                <li><b className='font-semibold'>Post-Merge Only</b> – Weekly predictions start after the merge.</li>
              </ul>
            </li>
            <li><b>Merge</b> – Predictions are made right after the merge episode airs.</li>
            <li><b>Finale</b> – Predictions are made just before the final episode.</li>
          </ul>
          <ScrollBar orientation='vertical' />
        </ScrollArea>
        <p className='text-sm'>
          A prediction may be required at multiple points (e.g., Draft, Merge, and Finale).
        </p>
      </PopoverContent>
    </Popover>
  );
}

