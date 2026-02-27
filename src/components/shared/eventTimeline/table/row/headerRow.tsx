import { TableHead, TableRow } from '~/components/common/table';
import { cn } from '~/lib/utils';

interface HeaderRowProps {
  label: string;
  leagueData?: boolean;
  edit?: boolean;
  noMembers?: boolean;
  noTribes?: boolean;
  labelOnly?: boolean;
}

export default function HeaderRow({ label, leagueData, edit, noMembers, noTribes, labelOnly }: HeaderRowProps) {
  return (
    <TableRow className='bg-white group hover:bg-muted px-4 gap-4 items-center text-nowrap'>
      {edit && (
        <TableHead className='transition-colors bg-white group-hover:bg-muted w-0 font-bold uppercase text-xs tracking-wider'>
          {labelOnly ? null : 'Edit'}
        </TableHead>
      )}
      <TableHead className='table-sticky-left transition-colors bg-white group-hover:bg-muted  font-bold uppercase text-xs tracking-wider w-0'>
        <div className={cn(labelOnly && 'border-r-transparent!')}>{label}</div>
      </TableHead>
      {leagueData && (
        <TableHead className='text-center font-bold uppercase text-xs tracking-wider'>
          {labelOnly ? null : 'Points'}
        </TableHead>
      )}
      <TableHead className='font-bold uppercase text-xs tracking-wider'>
        {noTribes || labelOnly ? null : 'Tribes'}
      </TableHead>
      <TableHead className='text-left font-bold uppercase text-xs tracking-wider'>
        {labelOnly ? null : 'Castaways'}
      </TableHead>
      {!noMembers && (
        <TableHead className='w-full font-bold uppercase text-xs tracking-wider'>
          {labelOnly ? null : 'Members'}
        </TableHead>
      )}
      <TableHead className='font-bold uppercase text-xs tracking-wider'>
        {labelOnly ? null : 'Notes'}
      </TableHead>
    </TableRow>
  );
}
