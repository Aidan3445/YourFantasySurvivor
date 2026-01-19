import { PopoverArrow } from '@radix-ui/react-popover';
import { ScrollText, ExternalLink } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { TableCell } from '~/components/common/table';

interface NotesCellProps {
  notes: string[] | null;
}

export default function NotesCell({ notes }: NotesCellProps) {
  const filteredNotes = notes?.filter((note) => !!note);

  if (!filteredNotes || filteredNotes.length === 0) return (
    <TableCell>
      <span className='w-full flex justify-end'>
        <ScrollText className='w-8 h-8 shrink-0 opacity-30 cursor-not-allowed' />
      </span>
    </TableCell>
  );

  return (
    <TableCell>
      <Popover>
        <PopoverTrigger className='ml-auto flex justify-end hover:opacity-70 active:opacity-50 transition-opacity'>
          <ScrollText className='w-8 h-8 shrink-0 stroke-primary' />
        </PopoverTrigger>
        <PopoverContent
          className='w-max max-w-[40svw] border-2 border-primary/30 shadow-lg shadow-primary/20 bg-card pl-8'
          side='left'>
          <PopoverArrow className='fill-primary/30' />
          <ul className='list-disc'>
            {filteredNotes.map((note, index) => (
              <li className='text-sm' key={index}>
                {note.startsWith('https://')
                  ? (
                    <a
                      className='text-primary hover:underline inline-flex items-center gap-1 font-medium'
                      href={note}
                      target='_blank'
                      rel='noopener noreferrer'>
                      {note}
                      <ExternalLink className='w-3 h-3 shrink-0' />
                    </a>
                  ) : (
                    note
                  )}
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </TableCell>

  );
}
