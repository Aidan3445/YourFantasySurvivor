import { type ReactNode } from 'react';

type StatsSectionProps = {
    title: string | ReactNode;
    children: ReactNode;
}

export default function StatsSection({ title, children }: StatsSectionProps) {
  return (
    <section className='flex-1 m-1 rounded-lg border-2 border-black border-collapse select-none'>
      <h3 className='text-xl font-semibold border-b-2 border-black indent-1'>{title}</h3>
      {children}
    </section>
  );
}
