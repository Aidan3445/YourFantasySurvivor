import { HelpCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { PopoverArrow } from '@radix-ui/react-popover';

export default function PredictionTimingHelp() {
  return (
    <Popover modal hover>
      <PopoverTrigger className='bg-primary/30 rounded-md hover:bg-primary/40 transition-colors w-5 h-5 flex items-center justify-center'>
        <HelpCircle className='stroke-primary w-4 h-4' />
      </PopoverTrigger>
      <PopoverContent className='w-80 md:w-full border-2 border-primary/30 bg-card shadow-lg shadow-primary/20'>
        <PopoverArrow />
        <h3 className='text-lg font-bold uppercase tracking-wider mb-2'>Prediction Timing</h3>
        <p className='text-sm font-medium mb-2'>
          Prediction timing determines when players make their predictions.
          <br />
          Predictions can be set at various points in the season:
        </p>
        <div className='bg-accent/50 rounded-md border-2 border-primary/20'>
          <ScrollArea className='md:max-h-42 h-42'>
            <ul className='pl-4 text-sm font-medium space-y-1 pr-10'>
              <li><b className='font-bold'>Draft</b> – Predictions are locked in when players draft their teams, before the league starts.</li>
              <li><b className='font-bold'>Weekly</b> – Predictions are made each week. Can apply to:
                <ul className='list-[revert] pl-4 mt-1 space-y-1'>
                  <li><b className='font-bold'>Default</b> – Every week from draft to finale.</li>
                  <li><b className='font-bold'>Pre-Merge Only</b> – Weekly predictions end once the tribes merge.</li>
                  <li><b className='font-bold'>Post-Merge Only</b> – Weekly predictions start after the merge.</li>
                </ul>
              </li>
              <li><b className='font-bold'>Merge</b> – Predictions are made right after the merge episode airs.</li>
              <li><b className='font-bold'>Finale</b> – Predictions are made just before the final episode.</li>
            </ul>
            <ScrollBar />
          </ScrollArea>
        </div>
        <p className='text-sm font-medium mt-2'>
          A prediction may be required at multiple points (e.g., Draft, Merge, and Finale),
          <br />
          but only one prediction will be made on a given episode.
        </p>
      </PopoverContent>
    </Popover>
  );
}

