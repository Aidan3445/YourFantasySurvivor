'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Trophy, ListPlus, Users } from 'lucide-react';
import CreateLeagueModal from '~/components/leagues/actions/league/create/modal';
import JoinLeagueModal from '~/components/home/quickActions/joinDialogue';
import { cn } from '~/lib/utils';
import { Button } from '~/components/common/button';

const DISMISS_STORAGE_KEY = 'floating-actions-dismissed-until';
const DISMISS_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const DRAG_THRESHOLD = 100; // pixels

export function FloatingActionsWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to prevent flash
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const dragStartPos = useRef({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Check dismissal status on mount
  useEffect(() => {
    const dismissedUntil = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (dismissedUntil) {
      const dismissedUntilTime = parseInt(dismissedUntil, 10);
      if (Date.now() < dismissedUntilTime) {
        setIsDismissed(true);
        return;
      } else {
        localStorage.removeItem(DISMISS_STORAGE_KEY);
      }
    }
    setIsDismissed(false);
  }, []);

  const dismissWidget = () => {
    const dismissUntil = Date.now() + DISMISS_DURATION_MS;
    localStorage.setItem(DISMISS_STORAGE_KEY, dismissUntil.toString());
    setIsDismissed(true);
  };

  const handleDragStart = (clientX?: number, clientY?: number) => {
    if (clientX === undefined || clientY === undefined) return;
    setIsDragging(true);
    setIsExpanded(false);
    dragStartPos.current = { x: clientX, y: clientY };
  };

  const handleDragMove = useCallback((clientX?: number, clientY?: number) => {
    if (!isDragging || clientX === undefined || clientY === undefined) return;

    const offsetX = clientX - dragStartPos.current.x;
    const offsetY = clientY - dragStartPos.current.y;
    setDragOffset({ x: offsetX, y: offsetY });
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;

    const distance = Math.sqrt(dragOffset.x ** 2 + dragOffset.y ** 2);

    if (distance >= DRAG_THRESHOLD) {
      dismissWidget();
    }

    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  }, [isDragging, dragOffset]);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, handleDragMove, handleDragEnd]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragStart(touch?.clientX, touch?.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragMove(touch?.clientX, touch?.clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  if (isDismissed) return null;

  const dragDistance = Math.sqrt(dragOffset.x ** 2 + dragOffset.y ** 2);
  const dismissProgress = Math.min(dragDistance / DRAG_THRESHOLD, 1);

  return (
    <div
      className='absolute md:bottom-4.5 md:right-4.5 bottom-[calc(.75rem+var(--navbar-height))] right-2.5 z-50'
      style={{
        transform: isDragging
          ? `translate(${dragOffset.x}px, ${dragOffset.y}px)`
          : undefined,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
      }}
      onMouseEnter={() => !isDragging && setIsExpanded(true)}
      onMouseLeave={() => !isDragging && setIsExpanded(false)}>
      <div className='relative'>
        {/* Expanded action buttons */}
        <div
          className={cn(
            'absolute transition-all duration-300 ease-out left-1/2 -translate-x-1/2',
            isExpanded && !isDragging
              ? 'opacity-100 pointer-events-auto -top-12 -translate-x-10'
              : 'opacity-0 pointer-events-none top-0'
          )}>
          <CreateLeagueModal>
            <button className='w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center hover:bg-accent hover:scale-110 transition-all shadow-lg'>
              <ListPlus className='w-6 h-6 stroke-primary' />
            </button>
          </CreateLeagueModal>
        </div>
        <div
          className={cn(
            'absolute transition-all duration-300 ease-out top-1/2 -translate-y-1/2',
            isExpanded && !isDragging
              ? 'opacity-100 pointer-events-auto -left-12 -translate-y-10'
              : 'opacity-0 pointer-events-none left-0'
          )}>
          <JoinLeagueModal>
            <Button className='w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center hover:bg-accent hover:scale-110 transition-all shadow-lg'>
              <Users className='w-6 h-6 stroke-primary' />
            </Button>
          </JoinLeagueModal>
        </div>

        {/* Main toggle button */}
        <button
          ref={buttonRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => !isDragging && setIsExpanded(!isExpanded)}
          className={cn(
            'shimmer-2 w-14 h-14 rounded-full bg-card border-2 border-primary flex items-center justify-center shadow-xl transition-all hover:scale-110 select-none touch-none',
            isExpanded && !isDragging && 'rotate-360 scale-110',
            isDragging && 'cursor-grabbing scale-105'
          )}
          style={{
            opacity: isDragging ? 1 - dismissProgress * 0.5 : 1,
            borderColor: isDragging && dismissProgress > 0.5
              ? 'rgb(239, 68, 68)' // red-500
              : undefined,
          }}>
          {isDragging && dismissProgress > 0.5 && (
            <svg
              className='w-7 h-7 stroke-red-500'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'>
              {dismissProgress > 0.5 && (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12' />
              )}
            </svg>
          )}
          <Trophy className='w-7 h-7 stroke-primary' />
        </button>

        {/* Dismiss indicator */}
        {isDragging && (
          <div
            className='absolute inset-0 flex items-center justify-center pointer-events-none'
            style={{ opacity: dismissProgress }}>
            <div
              className='absolute w-20 h-20 rounded-full border-2 border-dashed border-red-500'
              style={{
                transform: `scale(${1 + dismissProgress * 0.5})`,
                opacity: dismissProgress
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
