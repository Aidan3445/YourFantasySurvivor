import { useMemo } from 'react';
import { BaseEventFullName, BaseEventLabelPrefixes } from '~/lib/events';
import { type BaseEventName } from '~/types/events';

export function useEventLabel(eventName: string, isBaseEvent: boolean, eventLabel: string | null) {
  return useMemo(() => {
    const trimmed = eventLabel?.trim();
    if (trimmed) return trimmed;

    if (isBaseEvent) {
      return `${BaseEventLabelPrefixes[eventName as BaseEventName]} ${BaseEventFullName[eventName as BaseEventName]}`;
    }

    return eventName;
  }, [eventName, eventLabel, isBaseEvent]);
}

