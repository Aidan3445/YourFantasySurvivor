'use client';

import ColorRow from '~/components/shared/colorRow';
import { type EnrichedCastaway } from '~/types/castaways';
import { type Tribe } from '~/types/tribes';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '~/components/common/accordion';
import CastawayPopover from '~/components/shared/castaways/castawayPopover';
import { Badge } from '~/components/common/badge';

interface EpisodeMarkerProps {
  episodeNumber: number;
  episodeTitle?: string;
  tribes: Tribe[];
  castawaysByTribe: Record<number, EnrichedCastaway[]>;
  isKeyEpisode?: boolean;
  keyEpisodeLabel?: string;
}

export default function EpisodeMarker({
  episodeNumber,
  episodeTitle,
  tribes,
  castawaysByTribe,
  isKeyEpisode,
  keyEpisodeLabel
}: EpisodeMarkerProps) {
  const getBadgeColor = () => {
    if (keyEpisodeLabel === 'Premiere') return 'bg-green-500/20 text-green-600 border-green-500/40';
    if (keyEpisodeLabel === 'Finale') return 'bg-red-500/20 text-red-600 border-red-500/40';
    if (keyEpisodeLabel === 'Merge') return 'bg-blue-500/20 text-blue-600 border-blue-500/40';
    return 'bg-primary/20 text-primary border-primary/40';
  };

  return (
    <Accordion type='single' collapsible>
      <AccordionItem value='episode' className='border-0'>
        <AccordionTrigger className='p-3 bg-primary/5 border-2 border-primary/20 rounded-lg hover:bg-primary/10 hover:border-primary/30 hover:no-underline transition-all'>
          <div className='flex-1 text-left'>
            <div className='flex items-center gap-2 flex-wrap'>
              <span className='font-bold uppercase text-sm tracking-wider'>Episode {episodeNumber}</span>
              {isKeyEpisode && keyEpisodeLabel && (
                <Badge className={`${getBadgeColor()} border-2 font-black text-xs pointer-events-none`}>
                  {keyEpisodeLabel}
                </Badge>
              )}
            </div>
            {episodeTitle && (
              <span className='text-sm text-muted-foreground font-medium'>{episodeTitle}</span>
            )}
          </div>
        </AccordionTrigger>

        <AccordionContent className='pl-4 pt-3'>
          <div className='grid auto-cols-auto gap-3'>
            {tribes.map(tribe => {
              const tribesMembers = castawaysByTribe[tribe.tribeId] ?? [];
              if (tribesMembers.length === 0) return null;

              return (
                <div key={tribe.tribeId} className='bg-primary/5 border-2 border-primary/20 rounded-lg p-3'>
                  <div className='flex items-center gap-2 mb-2'>
                    <div
                      className='w-3 h-3 rounded-full shrink-0'
                      style={{ backgroundColor: tribe.tribeColor }} />
                    <h4 className='font-bold uppercase text-sm tracking-wider'>{tribe.tribeName}</h4>
                  </div>
                  <div className='w-full grid grid-cols-2 auto-cols-auto gap-1'>
                    {tribesMembers.map(castaway => (
                      <ColorRow
                        key={castaway.castawayId}
                        className='gap-2 px-2 py-1 h-8 border-2 font-medium'
                        color={tribe.tribeColor}>
                        <CastawayPopover castaway={castaway}>
                          <span className='leading-none text-sm cursor-pointer'>
                            {castaway.fullName}
                          </span>
                        </CastawayPopover>
                      </ColorRow>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
