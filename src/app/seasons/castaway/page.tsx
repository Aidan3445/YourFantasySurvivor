import { redirect } from 'next/navigation';

interface CastawayPageProps {
  searchParams: { castaway: string };
}

export default function CastawayPage({ searchParams }: CastawayPageProps) {

  if (!searchParams.castaway) redirect('/seasons');
  const castaway = searchParams.castaway;

  return (
    <div>
      <h1>{castaway}</h1>
    </div>
  );
}


