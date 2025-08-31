import { PopoverArrow } from '@radix-ui/react-popover';
import { ScrollText } from 'lucide-react';
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
        <ScrollText className='opacity-50' />
      </span>
    </TableCell>
  );

  return (
    <TableCell>
      <Popover>
        <PopoverTrigger className='ml-auto flex justify-end'>
          <ScrollText />
        </PopoverTrigger>
        <PopoverContent className='pl-6 w-max max-w-[40svw] min-w-72' side='left'>
          <PopoverArrow />
          <ul>
            {filteredNotes.map((note, index) => (
              <li className='list-disc' key={index}>
                {note.startsWith('https://') ?
                  <a
                    className='text-blue-500 underline'
                    href={note}
                    target='_blank'
                    rel='noopener noreferrer'>
                    {note}
                  </a> :
                  note}
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </TableCell>

  );
}

