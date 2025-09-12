import { Button } from '~/components/common/button';

interface NextButtonProps {
  disabled?: boolean;
  onClick?: () => void;
}

export default function NextButton({ disabled = false, onClick }: NextButtonProps) {
  return (
    <Button
      className='m-4 mt-auto w-80 self-center'
      type='button'
      disabled={disabled}
      onClick={onClick}>
      Next
    </Button>
  );
}
