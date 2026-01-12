'use client';

import { getContrastingColor } from '@uiw/color-convert';
import { useEffect, useMemo, useState } from 'react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { cn } from '~/lib/utils';
import { GripVertical, Lock, LockOpen, Shuffle, ListOrdered } from 'lucide-react';
import SortableItem from '~/components/common/sortableItem';
import { handleDragEnd } from '~/hooks/ui/useSortableItem';
import { Button } from '~/components/common/button';
import { useRouter } from 'next/navigation';
import ColorRow from '~/components/shared/colorRow';
import { useQueryClient } from '@tanstack/react-query';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import updateDraftOrder from '~/actions/updateDraftOrder';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { Badge } from '~/components/common/badge';

const SUFFLE_DURATION = 500;
const SHUFFLE_LOOPS = 4;

interface DraftOrderProps {
  overrideHash?: string;
  scrollHeight?: string;
  className?: string;
}

export default function DraftOrder({ overrideHash, scrollHeight, className }: DraftOrderProps) {
  const queryClient = useQueryClient();
  const { data: league } = useLeague(overrideHash);
  const { data: leagueMembers } = useLeagueMembers(overrideHash);

  const router = useRouter();
  const sensors = useSensors(useSensor(PointerSensor));
  const [locked, setLocked] = useState(true);

  const dbOrder = useMemo(() => leagueMembers?.members.map(m => ({ ...m, id: m.memberId })) ?? [], [leagueMembers?.members]);
  const [order, setOrder] = useState(dbOrder);

  useEffect(() => {
    if (!overrideHash && league?.status !== 'Predraft' && league?.hash) router.push(`/leagues/${league.hash}/draft`);
  }, [league, overrideHash, router]);

  useEffect(() => {
    if (!leagueMembers?.members) return;

    setOrder(leagueMembers.members.map(m => ({ ...m, id: m.memberId })));
  }, [leagueMembers?.members]);

  const orderChanged = useMemo(() => {
    if (!leagueMembers?.members || !order) return false;
    return leagueMembers.members.some((member, index) => member.memberId !== order[index]?.memberId);
  }, [leagueMembers?.members, order]);

  if (!leagueMembers) return null;

  const shuffleOrderWithAnimation = () => {
    // shuffle order by swapping items one by one
    let i = 0;
    const interval = setInterval(() => {
      if (++i < order.length * SHUFFLE_LOOPS) {
        const randomIndex = Math.floor(2 * order.length);
        setOrder((items) => {
          return arrayMove(items, i % order.length, randomIndex)
            .map((item, index) => ({ ...item, index }));
        });
      } else {
        clearInterval(interval);
      }
    }, SUFFLE_DURATION / (order.length * SHUFFLE_LOOPS));
  };

  const orderLocked = locked || league?.status !== 'Predraft';

  const handleSubmit = async () => {
    if (!league || !orderChanged || !leagueMembers) return;

    try {
      await updateDraftOrder(league?.hash, order.map((member) => member.memberId));
      await queryClient.invalidateQueries({ queryKey: ['leagueMembers', league.hash] });
      alert('Draft order saved');
      setLocked(true);
    } catch (error) {
      console.error(error);
      alert('Failed to save draft order');
    }
  };

  return (
    <article className={cn('relative overflow-hidden rounded-lg border-2 border-primary/20', className)}>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b-2 border-primary/20 bg-primary/5'>
        <span className='flex items-center gap-3'>
          <span className='h-6 w-1 bg-primary rounded-full' />
          <h2 className='text-xl font-black uppercase tracking-tight leading-none'>
            Draft Order
          </h2>
          {!orderLocked && (
            <Badge className='bg-blue-500/20 text-blue-600 border-blue-500/40 border-2 font-black text-xs pointer-events-none'>
              <ListOrdered className='w-3 h-3 mr-1' />
              EDITING
            </Badge>
          )}
        </span>

        <span className='flex items-center gap-2'>
          {!orderLocked && (
            <>
              <button
                onClick={shuffleOrderWithAnimation}
                className='p-2 bg-primary/10 border-2 border-primary/30 rounded-lg hover:bg-primary/20 hover:border-primary/40 transition-all'>
                <Shuffle className='w-5 h-5 text-primary' />
              </button>
              <Button
                type='button'
                size='sm'
                disabled={!orderChanged}
                variant='outline'
                className='font-bold uppercase text-xs tracking-wider border-destructive/40 text-destructive hover:bg-destructive/10'
                onClick={() => { setOrder(dbOrder); setLocked(true); }}>
                Cancel
              </Button>
              <Button
                type='submit'
                size='sm'
                disabled={!orderChanged}
                className='font-bold uppercase text-xs tracking-wider shadow-lg hover:shadow-xl transition-all'
                onClick={handleSubmit}>
                Save
              </Button>
            </>
          )}
          {leagueMembers.members.length > 1 && leagueMembers.loggedIn?.role === 'Owner' && (
            orderLocked ? (
              <Lock
                className='w-8 h-8 cursor-pointer stroke-primary hover:stroke-secondary active:stroke-secondary/75 transition-all'
                onClick={() => setLocked(false)}
              />
            ) : (
              <LockOpen
                className='w-8 h-8 cursor-pointer stroke-primary hover:stroke-secondary active:stroke-secondary/75 transition-all'
                onClick={() => { setLocked(true); setOrder(dbOrder); }}
              />
            )
          )}
        </span>
      </div>

      {/* Order List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToParentElement]}
        onDragEnd={(event) => handleDragEnd(event, setOrder)}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <ScrollArea className={cn('flex flex-col', scrollHeight && `overflow-y-auto ${scrollHeight}`)}>
            <div className='p-2 space-y-2'>
              {order.map((member, index) => {
                return (
                  <SortableItem
                    key={member.memberId}
                    id={member.memberId}
                    className='group'
                    disabled={orderLocked}>
                    <ColorRow
                      color={member.color}
                      loggedIn={leagueMembers.loggedIn?.memberId === member.memberId}
                      className='rounded-lg border-2 transition-all hover:border-primary/40'>
                      <span className='flex items-center gap-3 w-full'>
                        {/* Rank Badge */}
                        <span
                          className='inline-flex items-center justify-center w-8 h-8 rounded-md font-black text-sm shrink-0'
                          style={{
                            backgroundColor: `${member.color}40`,
                            color: getContrastingColor(member.color),
                            border: `2px solid ${member.color}66`
                          }}>
                          {index + 1}
                        </span>

                        {/* Name */}
                        <span
                          className='text-xl font-bold'
                          style={{ color: getContrastingColor(member.color) }}>
                          {member.displayName}
                        </span>

                        {/* Drag Handle */}
                        {!orderLocked && (
                          <GripVertical
                            className='ml-auto cursor-row-resize opacity-50 group-hover:opacity-100 transition-opacity shrink-0'
                            color={getContrastingColor(member.color)}
                          />
                        )}
                      </span>
                    </ColorRow>
                  </SortableItem>
                );
              })}
            </div>
            <ScrollBar className='pb-2 pt-1' />
          </ScrollArea>
        </SortableContext>
      </DndContext>
    </article>
  );
}
