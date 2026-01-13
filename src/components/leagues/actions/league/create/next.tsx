import { Button } from '~/components/common/button';
import { ChevronRight } from 'lucide-react';

interface NextButtonProps {
  disabled?: boolean;
  onClick?: () => void;
}

export default function NextButton({ disabled = false, onClick }: NextButtonProps) {
  return (
    <Button
      className='m-4 mt-auto w-80 self-center font-bold uppercase text-xs tracking-wider shadow-lg hover:shadow-xl transition-all'
      type='button'
      disabled={disabled}
      onClick={onClick}>
      Next
      <ChevronRight className='w-4 h-4 ml-1 shrink-0 stroke-primary-foreground' />
    </Button>
  );
}
