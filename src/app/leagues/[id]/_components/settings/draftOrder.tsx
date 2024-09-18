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
import { GripVertical } from 'lucide-react';
import { useToast } from '~/app/_components/commonUI/use-toast';
import { useRouter } from 'next/navigation';

interface DraftOrderProps extends ComponentProps {
  leagueId: number;
  draftOrder: { name: string, color: string, drafted: string | null }[];
  orderLocked: boolean;
  draftOver: boolean;
}

const SUFFLE_DURATION = 500;
const SHUFFLE_LOOPS = 2;

export default function DraftOrder({ leagueId, draftOrder, orderLocked, draftOver, className }: DraftOrderProps) {
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
                <SortableItem className='grid col-span-2 grid-cols-subgrid' key={member.name} id={member.id} disabled={orderLocked}>
                  <ColorRow className={cn('w-full tabular-nums', member.drafted ?? 'col-span-2')} color={color}>
                    <h3 style={{ color: getContrastingColor(color) }}>{index + 1} - {member.name}</h3>
                    {!orderLocked &&
                      <GripVertical
                        className='ml-auto cursor-row-resize'
                        color={getContrastingColor(color)} />}
                  </ColorRow>
                  {member.drafted &&
                    <ColorRow className='p-1 text-xs' color={color}>
                      <h3 style={{ color: getContrastingColor(color) }}>{member.drafted}</h3>
                    </ColorRow>}
                </SortableItem>
              );
            })}
          </SortableContext>
        </DndContext>
      </span>
    </section>
  );
}
