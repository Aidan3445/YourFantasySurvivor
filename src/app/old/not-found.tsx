import Image from 'next/image';
import CardContainer from './_components/cardContainer';

export default function NotFound() {
  return (
    <main>
      <CardContainer>
        <Image
          src='https://c.tenor.com/2urhaFhIGqIAAAAC/tenor.gif'
          alt='404: Page Not Found'
          width={1000}
          height={500}
          priority />
      </CardContainer>
      <h1 className='text-3xl font-semibold'>404: Page Not Found</h1>
    </main>
  );
}
