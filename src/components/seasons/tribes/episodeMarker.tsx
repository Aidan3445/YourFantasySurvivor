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
import { getContrastingColor } from '@uiw/color-convert';
import CastawayPopover from '~/components/shared/castaways/castawayPopover';

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
  return (
    <Accordion type='single' collapsible>
      <AccordionItem value='episode' className='border-0'>
        <AccordionTrigger className='p-3 bg-card rounded-lg hover:bg-accent hover:no-underline'>
          <div className='flex-1 text-left'>
            <div className='flex items-center gap-2'>
              <span className='font-semibold text-lg'>Episode {episodeNumber}</span>
              {isKeyEpisode && keyEpisodeLabel && (
                <span className='text-xs bg-primary text-primary-foreground px-2 py-1 rounded'>
                  {keyEpisodeLabel}
                </span>
              )}
            </div>
            {episodeTitle && (
              <span className='text-sm text-muted-foreground'>{episodeTitle}</span>
            )}
          </div>
        </AccordionTrigger>

        <AccordionContent className='pl-4 pt-2'>
          <div className='grid auto-cols-auto gap-2'>
            {tribes.map(tribe => {
              const tribesMembers = castawaysByTribe[tribe.tribeId] ?? [];
              if (tribesMembers.length === 0) return null;

              return (
                <div key={tribe.tribeId} className='bg-accent border rounded-lg p-2'>
                  <h4 className='font-semibold mb-2'>{tribe.tribeName}</h4>
                  <div className='w-full grid grid-cols-2 auto-cols-auto  gap-1'>
                    {tribesMembers.map(castaway => (
                      <ColorRow
                        key={castaway.castawayId}
                        className='gap-2 px-1 py-1 h-8'
                        color={tribe.tribeColor}>
                        <CastawayPopover castaway={castaway}>
                          <span
                            className='leading-none text-sm'
                            style={{
                              color: getContrastingColor(tribe.tribeColor)
                            }}>
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
    </Accordion >
  );
}
