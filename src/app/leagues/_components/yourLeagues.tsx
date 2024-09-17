import CardContainer from '~/app/_components/cardContainer';
import { Carousel, CarouselPrevious, CarouselNext, CarouselContent, CarouselItem } from '~/app/_components/commonUI/carousel';
import { getLeagues } from '~/app/api/leagues/query';

export default async function YourLeagues() {

  const yourLeagues = await getLeagues();

  if (yourLeagues.length === 0) {
    return (
      <div className='text-center'>
        <h1 className='mb-2 text-2xl font-semibold'>Your Leagues</h1>
        <h3>You are not a member of any leagues.</h3>
        <h3>Join or create a league to get started.</h3>
      </div>
    );
  }

  return (
    <div className='text-center'>
      <h1 className='text-2xl font-semibold'>Your Leagues</h1>
      <Carousel
        className='flex items-center'
        opts={{
          loop: true
        }}>
        <CarouselPrevious />
        <CarouselContent>
          {yourLeagues.map((league) => (
            <CarouselItem className='px-1 mx-1' key={league.id}>
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
