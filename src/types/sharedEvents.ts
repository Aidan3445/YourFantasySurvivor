import { z } from 'zod';

export const ReferenceOptions = ['Castaway', 'Tribe'] as const;
export type ReferenceType = typeof ReferenceOptions[number];
export const ReferenceZod = z.enum(ReferenceOptions);

export const EventPointsZod = z.coerce.number()
  .lte(512, { message: 'Points must not exceed 512' })
  .gte(-512, { message: 'Points must not be less than -512' });
export const EventDescZod = z.coerce.string()
  .min(3, { message: 'Description must be between 3 and 256 characters, or blank' })
  .max(256, { message: 'Description must be between 3 and 256 characters, or blank' });


export const TimingOptions = [
  'Draft', 'Weekly', 'After Merge', 'Before Finale',
  'Weekly (Premerge only)', 'Weekly (Postmerge only)'] as const;
export type TimingType = (typeof TimingOptions)[number];
export const TimingZod = z.enum(TimingOptions);


export const CustomEventTypes = ['Direct', 'Prediction'] as const;
export type CustomEventType = (typeof CustomEventTypes)[number];
export const CustomEventTypeZod = z.enum(CustomEventTypes);
