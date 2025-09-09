import { Flame } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel } from '~/components/common/form';
import { Input } from '~/components/common/input';
import { MultiSelect } from '~/components/common/multiSelect';
import { Switch } from '~/components/common/switch';
import { PredictionTimings } from '~/lib/events';
import { type ScoringBaseEventName } from '~/types/events';

export interface BaseEventSettingsProps {
  disabled?: boolean;
}

interface BasePredictionFormFieldProps extends BaseEventSettingsProps {
  eventName: ScoringBaseEventName;
}

export function BasePredictionFormField({ disabled, eventName }: BasePredictionFormFieldProps) {
  return (
    <FormField
      name={`basePredictionRules.${eventName}.enabled`}
      render={({ field: enabledField }) => (
        <>
          <span className='pl-4 inline-flex flex-wrap gap-1 items-start font-normal text-xs'>
            <FormItem className='flex gap-2 mb-2 items-center'>
              <FormLabel>
                Prediction:
              </FormLabel>
              {disabled && !enabledField.value &&
                <h2 className='font-semibold text-destructive'>Off</h2>}
              {!disabled &&
                <FormControl>
                  <Switch
                    checked={enabledField.value as boolean}
                    onCheckedChange={(checked) => enabledField.onChange(checked)} />
                </FormControl>}
            </FormItem>
            {enabledField.value && (
              <FormField
                name={`basePredictionRules.${eventName}.points`}
                render={({ field: pointsField }) => (
                  <FormItem>
                    {disabled &&
                      <h2 className='font-bold text-card-foreground text-nowrap'>
                        {pointsField.value}
                        <Flame size={14} className='inline align-text-bottom mb-0.5 stroke-green-600' />
                      </h2>}
                    {!disabled &&
                      <FormControl className='animate-scale-in-fast'>
                        <Input
                          className='w-14 h-min py-0 px-2 text-black'
                          type='number'
                          step={1}
                          placeholder='Points'
                          disabled={disabled}
                          {...pointsField} />
                      </FormControl>}
                  </FormItem>
                )} />)}
          </span>
          {enabledField.value && (
            <FormField
              name={`basePredictionRules.${eventName}.timing`}
              render={({ field: timingField }) => (
                <FormItem>
                  {disabled &&
                    <div className='italic -mt-2 ml-4 text-muted-foreground text-xs'>{(timingField.value as string[]).join(', ')}</div>
                  }
                  {!disabled &&
                    <FormControl className='animate-scale-in-fast mb-2'>
                      <MultiSelect
                        options={PredictionTimings
                          .map((option) => ({ label: option, value: option }))}
                        onValueChange={timingField.onChange}
                        defaultValue={timingField.value as string[]}
                        value={timingField.value as string[]}
                        maxCount={1}
                        disabled={disabled}
                        empty={disabled}
                        modalPopover
                        placeholder='Select prediction timing' />
                    </FormControl>
                  }
                </FormItem>
              )} />
          )}
        </>
      )} />
  );
}

