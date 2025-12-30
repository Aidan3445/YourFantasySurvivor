import { Card, CardContent } from '~/components/common/card';
import { Trophy } from 'lucide-react';
import Image from 'next/image';

export default function LoadingLeagues() {
  return (
    <Card className='h-full absolute inset-0 z-10 flex items-center justify-center'>
      <CardContent className='flex flex-col items-center justify-center'>
        <Trophy className='w-12 h-12 text-muted-foreground mb-4' />
        <p className='text-muted-foreground mb-4'>
          Fetching your league data, please wait...
        </p>
        <Image
          src='/Logo.png'
          alt='Loading'
          width={150}
          height={150}
          className='animate-loading-spin w-auto h-auto'
        />
      </CardContent>
    </Card>
  );
}
