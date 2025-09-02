import { Slider } from '~/components/common/slider';
import { MAX_SURVIVAL_CAP } from '~/types/deprecated/leagues';

interface SurvivalCapSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function SurvivalCapSlider({ value, onChange, disabled }: SurvivalCapSliderProps) {
  return (
    <span className='flex gap-2 items-center mb-4'>
      0
      <Slider
        max={MAX_SURVIVAL_CAP}
        step={1}
        min={0}
        disabled={disabled}
        value={[value]}
        onValueChange={(v) => onChange(v[0]!)}>
        <div className='mt-3 font-semibold'>
          {value === 0 ? 'Off' : value === MAX_SURVIVAL_CAP ? 'Unlimited' : value}
        </div>
      </Slider>
      {MAX_SURVIVAL_CAP}
    </span>
  );
}

