import { Infinity as InfinityIcon } from 'lucide-react';
import { Slider } from '~/components/common/slider';
import { MAX_SEASON_LENGTH } from '~/lib/leagues';

interface SurvivalCapSliderProps {
  value: number;
  onChange: (_value: number) => void;
  maxLabel?: string;
  disabled?: boolean;
}

export default function SeasonLengthSlider({
  value,
  onChange,
  maxLabel = 'Unlimited',
  disabled
}: SurvivalCapSliderProps) {
  return (
    <span className='flex gap-2 items-center mb-4'>
      0
      <Slider
        max={MAX_SEASON_LENGTH}
        step={1}
        min={0}
        disabled={disabled}
        value={[value]}
        onValueChange={(v) => onChange(v[0]!)}>
        <div className='mt-3 font-semibold text-nowrap'>
          {value === 0 ? 'Off' : value === MAX_SEASON_LENGTH ? maxLabel : value}
        </div>
      </Slider>
      <InfinityIcon />
    </span>
  );
}

