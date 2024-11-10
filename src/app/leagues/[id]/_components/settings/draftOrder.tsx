'use client';
import { cn, type ComponentProps } from '~/lib/utils';
import { ColorRow } from '../scores/membersScores';
import { getContrastingColor } from '@uiw/color-convert';
import { useState } from 'react';
import { Button } from '~/app/_components/commonUI/button';
import { updateDraftOrder } from '~/app/api/leagues/[id]/settings/actions';
import { closestCenter, DndContext, PointerSensor, type UniqueIdentifier, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import SortableItem, { handleDragEnd } from '~/app/_components/commonUI/sortableItem';
import { ChevronRight, GripVertical } from 'lucide-react';
import { useToast } from '~/app/_components/commonUI/use-toast';
import { useRouter } from 'next/navigation';
import { type SeasonEventRuleType } from '~/server/db/schema/seasonEvents';
import { type WithPick } from '~/app/api/leagues/[id]/score/query';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '~/app/_components/commonUI/hover';
import { PredictionCard } from './predictionCard';
import { HoverCardArrow, HoverCardPortal } from '@radix-ui/react-hover-card';

interface DraftOrderProps extends ComponentProps {
  leagueId: number;
  draftOrder: { name: string, color: string, drafted: string[] }[];
  predictions?: (SeasonEventRuleType & WithPick & { member: string | null })[];
  orderLocked: boolean;
  draftOver: boolean;
}

const SUFFLE_DURATION = 500;
const SHUFFLE_LOOPS = 2;

export default function DraftOrder({
  leagueId,
  draftOrder,
  predictions = [],
  orderLocked,
  draftOver,
  className
}: DraftOrderProps) {
  const [order, setOrder] = useState(draftOrder
    .map((member) => ({ ...member, id: member.name as UniqueIdentifier })));
  const sensors = useSensors(useSensor(PointerSensor));
  const router = useRouter();
  const { toast } = useToast();

  const shuffleOrderWithAnimation = () => {
    // shuffle order by swapping items one by one
    let i = 0;
    const interval = setInterval(() => {
      if (++i < order.length * SHUFFLE_LOOPS) {
        const randomIndex = Math.floor(Math.random() * order.length);
        setOrder((items) => {
          return arrayMove(items, i % order.length, randomIndex)
            .map((item, index) => ({ ...item, index }));
        });
      } else {
        clearInterval(interval);
      }
    }, SUFFLE_DURATION / (order.length * SHUFFLE_LOOPS));
  };

  const saveOrder = () => {
    const update = updateDraftOrder.bind(null, leagueId, order.map((member) => member.name));

    update()
      .then(() => {
        toast({
          title: 'Draft order saved',
          description: 'The draft order has been saved',
        });
        router.refresh();
      })
      .catch((e) => {
        if (e instanceof Error) {
          toast({
            title: 'Error saving draft order',
            description: e.message,
            variant: 'error',
          });
        }
      });
  };

  return (
    <section className={className}>
      {!orderLocked && <span className='grid grid-cols-2 gap-1 w-full'>
        <Button onClick={shuffleOrderWithAnimation}>Shuffle</Button>
        <form action={saveOrder}>
          <Button className='w-full' type='submit'>Save</Button>
        </form>
      </span>}
      <span className='grid auto-cols-auto gap-1'>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToParentElement]}
          onDragEnd={(event) => handleDragEnd(event, setOrder)}>
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            {order.map((member, index) => {
              const color = member.drafted && !draftOver ? '#AAAAAA' : member.color;
              return (
                <PredictionHover
                  key={member.name}
                  className='grid grid-cols-[repeat(3,_minmax(0,_1fr))_10px] gap-1'
                  predictions={predictions.filter((rule) => rule.member === member.name)}>
                  <SortableItem
                    id={member.id}
                    className='grid grid-cols-subgrid col-span-3'
                    disabled={orderLocked}>
                    <ColorRow
                      className={cn('w-full tabular-nums', member.drafted ? 'col-span-2' : 'col-span-3')}
                      color={color}>
                      <h3 style={{ color: getContrastingColor(color) }}>{index + 1} - {member.name}</h3>
                      {!orderLocked &&
                        <GripVertical
                          className='ml-auto cursor-row-resize'
                          color={getContrastingColor(color)} />}
                    </ColorRow>
                    {member.drafted &&
                      <ColorRow className='p-1 text-xs flex justify-center' color={color}>
                        <h3 style={{ color: getContrastingColor(color) }}>{member.drafted[0]}</h3>
                      </ColorRow>}
                  </SortableItem>
                </PredictionHover>
              );
            })}
          </SortableContext>
        </DndContext>
      </span>
    </section>
  );
}

interface PredictionHoverProps extends ComponentProps {
  predictions: (SeasonEventRuleType & WithPick & { member: string | null })[];
}

function PredictionHover({ predictions, children, className }: PredictionHoverProps) {
  if (predictions.length === 0) return children;

  //split the predictions into premier, merge, and finale
  const groups = predictions.reduce((acc, rule) => {
    if (rule.timing === 'premiere') acc.premiere.push(rule);
    else if (rule.timing === 'merge') acc.merge.push(rule);
    else acc.finale.push(rule);
    return acc;
  }, { premiere: [], merge: [], finale: [] } as {
    premiere: (SeasonEventRuleType & WithPick)[];
    merge: (SeasonEventRuleType & WithPick)[];
    finale: (SeasonEventRuleType & WithPick)[];
  });

  return (
    <HoverCard openDelay={100} closeDelay={0}>
      <HoverCardTrigger className={className}>
        {children}
        <ChevronRight />
      </HoverCardTrigger>
      <HoverCardPortal>
        <HoverCardContent side='right' sideOffset={10} className='w-72 max-h-80 light-scroll py-1'>
          <HoverCardArrow />
          <section className='flex flex-col gap-1'>
            {groups.premiere.length > 0 &&
              <h3 className='text-center font-semibold'>Premiere</h3>}
            {groups.premiere.map((p, index) => (
              <PredictionCard
                key={index}
                prediction={p}
                parity={index % 2 === 0}>
                <ColorRow color={p.pick.color ?? 'white'} className='p-1 mt-1'>
                  <h3 style={{ color: getContrastingColor(p.pick.color ?? 'white') }}>
                    {p.pick.castaway ?? p.pick.tribe ?? p.pick.member}
                  </h3>
                </ColorRow>
              </PredictionCard>
            ))}
            {groups.merge.length > 0 &&
              <h3 className='text-center font-semibold'>Merge</h3>}
            {groups.merge.map((p, index) => (
              <PredictionCard
                key={index}
                prediction={p}
                parity={(groups.premiere.length + index) % 2 === 0}>
                <ColorRow color={p.pick.color ?? 'white'} className='p-1 mt-1'>
                  <h3 style={{ color: getContrastingColor(p.pick.color ?? 'white') }}>
                    {p.pick.castaway ?? p.pick.tribe ?? p.pick.member}
                  </h3>
                </ColorRow>
              </PredictionCard>
            ))}
            {groups.finale.length > 0 &&
              <h3 className='text-center font-semibold'>Finale</h3>}
            {groups.finale.map((p, index) => (
              <PredictionCard
                key={index}
                prediction={p}
                parity={(groups.premiere.length + groups.merge.length + index) % 2 === 0}>
                <ColorRow color={p.pick.color ?? 'white'} className='p-1 mt-1'>
                  <h3 style={{ color: getContrastingColor(p.pick.color ?? 'white') }}>
                    {p.pick.castaway ?? p.pick.tribe ?? p.pick.member}
                  </h3>
                </ColorRow>
              </PredictionCard>
            ))}
          </section>
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCard>
  );
}
