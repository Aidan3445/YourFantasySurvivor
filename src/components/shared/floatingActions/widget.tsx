'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Trophy, ListPlus, Users, X } from 'lucide-react';
import CreateLeagueModal from '~/components/leagues/actions/league/create/modal';
import JoinLeagueModal from '~/components/leagues/actions/league/join/modal';
import { cn } from '~/lib/utils';
import { Button } from '~/components/common/button';

const DISMISS_STORAGE_KEY = 'floating-actions-dismissed-until';
const DISMISS_DURATION_MS = 5 * 60 * 1000; // 5 minutes

const DISMISS_ZONE = {
  width: 120,
  height: 120,
};

export function FloatingActionsWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to prevent flash
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isOverDismissZone, setIsOverDismissZone] = useState(false);

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

  const checkIfOverDismissZone = useCallback((clientX: number, clientY: number) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const zoneLeft = centerX - DISMISS_ZONE.width / 2;
    const zoneRight = centerX + DISMISS_ZONE.width / 2;
    const zoneTop = centerY - DISMISS_ZONE.height / 2;
    const zoneBottom = centerY + DISMISS_ZONE.height / 2;

    return (
      clientX >= zoneLeft &&
      clientX <= zoneRight &&
      clientY >= zoneTop &&
      clientY <= zoneBottom
    );
  }, []);

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

    setIsOverDismissZone(checkIfOverDismissZone(clientX, clientY));
  }, [isDragging, checkIfOverDismissZone]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;

    if (isOverDismissZone) {
      dismissWidget();
    }

    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    setIsOverDismissZone(false);
  }, [isDragging, isOverDismissZone]);

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
  }, [isDragging, handleDragMove, handleDragEnd]);

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

  return (
    <div className='fixed inset-0 pointer-events-none overflow-hidden z-50'>
      {/* Dismiss zone - appears when dragging */}
      {isDragging && (
        <div className='absolute inset-0 flex items-center justify-center'>
          <div
            className={cn(
              'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-all duration-200',
              isOverDismissZone
                ? 'bg-red-500/30 border-red-500 scale-110'
                : 'bg-muted/50 border-muted-foreground/30'
            )}
            style={{
              width: DISMISS_ZONE.width,
              height: DISMISS_ZONE.height,
            }}>
            <X
              className={cn(
                'w-8 h-8 transition-colors',
                isOverDismissZone ? 'text-red-500' : 'text-muted-foreground/50'
              )}
            />
            <span
              className={cn(
                'text-xs font-medium transition-colors',
                isOverDismissZone ? 'text-red-500' : 'text-muted-foreground/50'
              )}>
              Release to hide
            </span>
          </div>
        </div>
      )}

      <div
        className={cn(
          'pointer-events-auto absolute md:bottom-4.5 md:right-4.5 bottom-[calc(.75rem+var(--navbar-height))] right-2.5',
          isExpanded && 'pl-14 pt-14 rounded-tl-[50%]'
        )}
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
                ? 'opacity-100 pointer-events-auto -top-14 -translate-x-10'
                : 'opacity-0 pointer-events-none top-0'
            )}>
            <CreateLeagueModal>
              <Button
                className='relative w-12 h-12 rounded-lg bg-accent border-2 border-primary/40 flex items-center justify-center hover:bg-secondary/90 hover:border-primary/60 hover:scale-110 transition-all shadow-lg shadow-primary/20 p-0'
                onClick={() => setIsExpanded(false)}>
                <ListPlus className='w-5 h-5 text-primary' />
              </Button>
            </CreateLeagueModal>
          </div>
          <div
            className={cn(
              'absolute transition-all duration-300 ease-out top-1/2 -translate-y-1/2',
              isExpanded && !isDragging
                ? 'opacity-100 pointer-events-auto -left-14 -translate-y-10'
                : 'opacity-0 pointer-events-none left-0'
            )}>
            <JoinLeagueModal>
              <Button
                className='relative w-12 h-12 rounded-lg bg-accent border-2 border-primary/40 flex items-center justify-center hover:bg-secondary/90 hover:border-primary/60 hover:scale-110 transition-all shadow-lg shadow-primary/20 p-0'
                onClick={() => setIsExpanded(false)}>
                <Users className='w-5 h-5 text-primary' />
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
              'relative w-16 h-16 rounded-xl bg-linear-to-br from-primary to-primary/80 flex items-center justify-center shadow-2xl shadow-primary/30 transition-all hover:scale-110 hover:shadow-primary/40 select-none touch-none overflow-hidden',
              isExpanded && !isDragging && 'scale-110 rotate-12',
              isDragging && 'cursor-grabbing scale-105',
              isOverDismissZone && 'scale-90 opacity-50'
            )}
            style={{
              background: isOverDismissZone
                ? 'linear-gradient(135deg, rgb(239, 68, 68), rgb(220, 38, 38))'
                : undefined,
            }}>
            {/* Shine Effect */}
            <div className='absolute inset-0 bg-linear-to-br from-white/30 via-transparent to-transparent opacity-50' />

            <div>
              {isOverDismissZone ? (
                <X className='w-8 h-8 text-white z-10' />
              ) : (
                <Trophy className='w-8 h-8 stroke-primary-foreground z-10' />
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
