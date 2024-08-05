import { type TitleStat } from '~/app/api/seasons/[name]/events/stats';

interface TitlesTableProps {
  titles: TitleStat[];
}

export default function TitlesTable({ titles }: TitlesTableProps) {
  if (titles.length === 0) {
    return <h2 className='text-lg text-center'>No titles yet in this season.</h2>;
  }

  // pad titles with at least 9 entries
  while (titles.length < 9) {
    titles.push({ name: '-', count: 0 });
  }

  return (
    <figure className='stats-scroll'>
      {titles.map((title, index) => (
        <span key={index} className={`grid grid-cols-3 text-xs text-center border-r border-black divide-x divide-black lg:text-sm ${index & 1 ? 'bg-white/20' : 'bg-white/10'}`}>
          <h3 className='col-span-2 px-1 font-medium text-md'>{title.name}</h3>
          <h4 className='font-normal'>{title.count ? title.count : '-'}</h4>
        </span>))}
    </figure>
  );
}
