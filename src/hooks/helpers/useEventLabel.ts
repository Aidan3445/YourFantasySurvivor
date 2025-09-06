import { useMemo } from 'react';
import { baseEventLabelPrefixes } from '~/lib/events';
import { type BaseEventName } from '~/types/events';

export function useEventLabel(eventName: string, isBaseEvent: boolean, eventLabel: string | null) {
  return useMemo(() => {
    const trimmed = eventLabel?.trim();
    if (trimmed) return trimmed;

    if (isBaseEvent) {
      return `${baseEventLabelPrefixes[eventName as BaseEventName]} ${eventName}`;
    }
    return eventName;
  }, [eventName, eventLabel, isBaseEvent]);
}

