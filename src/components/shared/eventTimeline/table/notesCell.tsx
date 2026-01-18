import { PopoverArrow } from '@radix-ui/react-popover';
import { ScrollText, ExternalLink } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { TableCell } from '~/components/common/table';

interface NotesCellProps {
  notes: string[] | null;
}

function NoteLink({ note }: { note: string }) {
  if (note.startsWith('https://')) {
    return (
      <a
        className='text-primary hover:underline inline-flex items-center gap-1 font-medium'
        href={note}
        target='_blank'
        rel='noopener noreferrer'
      >
        {note}
        < ExternalLink className='w-3 h-3 shrink-0' />
      </a >
    );
  }
  return <>{note}</>;
}

export default function NotesCell({ notes }: NotesCellProps) {
  const filteredNotes = notes?.filter((note) => !!note);

  if (!filteredNotes || filteredNotes.length === 0) {
    return (
      <TableCell>
        <span className='w-full flex justify-end @container'>
          <ScrollText className='w-8 h-8 shrink-0 opacity-30 cursor-not-allowed @min-sm:hidden' />
        </span>
      </TableCell>
    );
  }

  return (
    <TableCell>
      <div className='@container text-left'>
        {/* Inline version - shown when container is wide enough */}
        <ul className='hidden @min-sm:block list-disc list-inside w-full'>
          {filteredNotes.map((note, index) => (
            <li className='list-item text-sm' key={index}>
              <NoteLink note={note} />
            </li>
          ))}
        </ul>

        {/* Popover version - shown when container is narrow */}
        <div className='@min-sm:hidden flex justify-end'>
          <Popover>
            <PopoverTrigger className='hover:opacity-70 active:opacity-50 transition-opacity'>
              <ScrollText className='w-8 h-8 shrink-0 stroke-primary' />
            </PopoverTrigger>
            <PopoverContent
              className='w-max max-w-[40svw] border-2 border-primary/30 shadow-lg shadow-primary/20 bg-card'
              side='left'>
              <PopoverArrow className='fill-primary/30' />
              <ul className='list-disc list-inside'>
                {filteredNotes.map((note, index) => (
                  <li className='text-sm' key={index}>
                    <NoteLink note={note} />
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </TableCell>
  );
}
