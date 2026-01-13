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
  }[];
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
    <div className='flex flex-col p-2 rounded-lg border-2 border-primary/30 bg-card shadow-lg shadow-primary/20 scale-75'>
      <div className='font-bold uppercase tracking-wider text-center'>Episode {label}</div>
      <Separator className='mb-1 bg-primary/20' />
      <div className='flex gap-4'>
        <div className='grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1'>
          {firstSet.map((p) => {
            const prevScore = data.find((d) => d.name === p.dataKey)?.episodeScores[episodeNumber - 1];
            const delta = prevScore !== undefined ? p.value - prevScore : undefined;
            return (
              <ColorRow
                key={p.dataKey}
                className='col-span-3 grid grid-cols-subgrid text-lg font-medium'
                color={p.stroke}
              >
                <p className='text-start text-inherit'>{p.dataKey}</p>
                <p className='text-end text-inherit'>{p.value}</p>
                <p className='text-end text-inherit opacity-80'>
                  {delta ? `${delta < 0 ? '' : '+'}${delta}` : ''}
                </p>
              </ColorRow>
            );
          })}
        </div>
        {secondSet.length > 0 && (
          <div className='grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1'>
            {secondSet.map((p) => {
              const prevScore = data.find((d) => d.name === p.dataKey)?.episodeScores[episodeNumber - 1];
              const delta = prevScore !== undefined ? p.value - prevScore : undefined;
              return (
                <ColorRow
                  key={p.dataKey}
                  className='col-span-3 grid grid-cols-subgrid text-lg font-medium'
                  color={p.stroke}
                >
                  <p className='text-start text-inherit'>{p.dataKey}</p>
                  <p className='text-end text-inherit'>{p.value}</p>
                  <p className='text-end text-inherit opacity-70'>
                    {delta ? `(${delta < 0 ? '' : '+'}${delta})` : ''}
                  </p>
                </ColorRow>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
