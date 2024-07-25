import CardContainer from '~/app/_components/cardContainer';
import { Carousel, CarouselPrevious, CarouselNext, CarouselContent, CarouselItem } from '~/app/_components/commonUI/carousel';
import { getLeagues } from '~/app/api/leagues/query';

export default async function YourLeagues() {

  let yourLeagues: { name: string, season: string, id: number }[] = [];
  try {
    yourLeagues = await getLeagues();
  } catch (e) {
    if (!(e instanceof Error)) return <div>ERROR: {e as string}</div>;
    return <div>ERROR: {e.message}</div>;
  }

  return (
    <div className='text-center'>
      <h1 className='text-2xl font-semibold'>Your Leagues</h1>
      <Carousel
        className='flex gap-3 items-center'
        opts={{
          loop: true
        }}>
        <CarouselPrevious />
        <CarouselContent>
          {yourLeagues.map((league) => (
            <CarouselItem className='' key={league.id}>
              <CardContainer className='p-6' key={league.id}>
                <a className='flex flex-col' href={`/leagues/${league.id}`}>
                  <div>{league.name}</div>
                  <div>{league.season}</div>
                </a>
              </CardContainer>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselNext />
      </Carousel>
    </div>
  );
}
