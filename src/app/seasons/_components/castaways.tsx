import { useEffect, useState } from 'react';
import { type CastawayDetails } from '~/app/api/seasons/[name]/castaways/query';

interface CastawaysProps {
  season: string;
}

export default function Castaways({ season }: CastawaysProps) {
  const [castaways, setCastaways] = useState<CastawayDetails[]>([]);

  useEffect(() => {
    if (season) {
      fetch(`/api/seasons/${season}/castaways`)
        .then((res) => res.json())
        .then((data: CastawayDetails[]) => setCastaways(data))
        .catch((err) => console.error(err));
    }
  }, [season]);

  console.log(castaways);

  return (
    <div>
      <h2>Castaways</h2>
      <ul>
        {castaways.map((castaway, index) => (
          <li key={index}>{castaway.name}</li>
        ))}
      </ul>
    </div>
  );
}
