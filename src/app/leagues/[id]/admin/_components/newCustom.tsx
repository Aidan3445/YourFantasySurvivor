'use client';
import { type ComponentProps } from '~/lib/utils';
import { type CastawayDetails } from '~/server/db/schema/castaways';
import { type CustomEventRuleType } from '~/server/db/schema/customEvents';
import { type Member } from '~/server/db/schema/members';
import { type Tribe } from '~/server/db/schema/tribes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/app/_components/commonUI/select';
import { useState } from 'react';
import { type AltEvents } from '~/app/api/leagues/[id]/score/query';

interface NewEventProps extends ComponentProps {
  rules: CustomEventRuleType[];
  events: AltEvents | null;
  leagueId: number;
  castaways: CastawayDetails[];
  tribes: Tribe[];
  members: Member[];
  remaining: CastawayDetails[];
}

export default function NewCustomEvent({
  rules,
  events,
  //leagueId,
  //castaways,
  tribes,
  members,
  remaining,
}: NewEventProps) {
  const [selectedRule, setSelectedRule] = useState<CustomEventRuleType | null>(null);

  const getRuleById = (id: string) => {
    const idNum = parseInt(id);
    setSelectedRule(rules.find((r) => r.id === idNum) ?? null);
  };

  return (
    <section>
      <Select onValueChange={getRuleById}>
        <SelectTrigger>
          <SelectValue placeholder='Select rule' />
        </SelectTrigger>
        <SelectContent>
          {rules
            .filter((r) => r.id)
            .map((rule) => (
              <SelectItem value={rule.id!.toString()} key={rule.id}> {rule.name} </SelectItem>
            ))}
        </SelectContent>
      </Select>
      {selectedRule && (
        <article>
          <h3 className='text-xl font-semibold'>{selectedRule.name}</h3>
          <p>{selectedRule.description}</p>
          {selectedRule.referenceType === 'castaway' && <ul>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder='Select castaway' />
              </SelectTrigger>
              <SelectContent>
                {remaining.map((c) => (
                  <SelectItem value={c.name} key={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ul>}
          {selectedRule.referenceType === 'tribe' && <ul>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder='Select tribe' />
              </SelectTrigger>
              <SelectContent>
                {tribes.map((t) => (
                  <SelectItem value={t.name} key={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ul>}
          {selectedRule.referenceType === 'member' && <ul>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder='Select member' />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem value={m.displayName} key={m.id}>{m.displayName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ul>}
        </article>
      )}
      <br />
      {(events?.castawayEvents?.length ?? 0) > 0 && <h2>Castaway events</h2>}
      {events?.castawayEvents.map((e) => (
        <article key={e.name} className='bg-b3/80 rounded-md'>
          <h3 className='text-xl font-semibold'>{e.name}</h3>
          <p>{e.description}</p>
        </article>
      ))}
      <br />
      {(events?.tribeEvents?.length ?? 0) > 0 && <h2>Tribe events</h2>}
      {events?.tribeEvents.map((e) => (
        <article key={e.name} className='bg-b3/80 rounded-md'>
          <h3 className='text-xl font-semibold'>{e.name}</h3>
          <p>{e.description}</p>
          <p>Episode: {e.episode}</p>
        </article>
      ))}
      <br />
      {(events?.memberEvents?.length ?? 0) > 0 && <h2>Member events</h2>}
      {events?.memberEvents.map((e) => (
        <article key={e.name} className='bg-b3/80 rounded-md'>
          <h3 className='text-xl font-semibold'>{e.name}</h3>
          <p>{e.description}</p>
        </article>
      ))}
    </section>
  );
}
