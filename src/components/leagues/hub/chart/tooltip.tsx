import { Separator } from '~/components/common/separator';
import ColorRow from '~/components/shared/colorRow';

interface CustomTooltipProps {
  payload?: {
    dataKey: string;
    value: number;
    stroke: string;
  }[];
  label?: string;
  data: {
    name: string;
    episodeScores: number[];
    color: string;
  }[]
}

export default function CustomTooltip({ payload, label, data }: CustomTooltipProps) {
  if (!label || !payload) return;

  payload.sort((a, b) => b.value - a.value);

  let firstSet: typeof payload, secondSet: typeof payload;

  if (payload.length > 9) {
    firstSet = payload.slice(0, payload.length / 2);
    secondSet = payload.slice(payload.length / 2);
  } else {
    firstSet = payload;
    secondSet = [];
  }

  const episodeNumber = Number(label);

  return (
    <div className='flex flex-col p-1 rounded-md border border-black bg-b3/95 scale-75'>
      <div>Episode {label}:</div>
      <Separator className='mb-1' />
      <div className='flex gap-2'>
        <div className='grid gap-1 grid-cols-min'>
          {firstSet.map((p) => {
            const prevScore = data.find((d) => d.name === p.dataKey)?.episodeScores[episodeNumber - 1];
            const delta = prevScore !== undefined ? p.value - prevScore : undefined;
            return (
              <ColorRow key={p.dataKey} color={p.stroke}>
                {p.dataKey}
                <div className='w-full' />
                {p.value}
                {!!delta && ` (${delta < 0 ? '' : '+'}${delta})`}
              </ColorRow>
            );
          })}
        </div>
        {secondSet.length > 0 && (
          <div className='grid gap-1 grid-cols-min'>
            {secondSet.map((p) => {
              const prevScore = data.find((d) => d.name === p.dataKey)?.episodeScores[episodeNumber - 1];
              const delta = prevScore !== undefined ? p.value - prevScore : undefined;
              return (
                <ColorRow key={p.dataKey} color={p.stroke}>
                  {p.dataKey}
                  <div className='w-full' />
                  {p.value}
                  {!!delta && ` (${delta < 0 ? '' : '+'}${delta})`}
                </ColorRow>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

