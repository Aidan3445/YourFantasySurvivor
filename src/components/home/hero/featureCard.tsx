import { type ReactNode } from 'react';

export interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className='flex flex-col items-center text-center p-3 rounded-lg bg-accent/50'>
      <div className='text-primary mb-2'>
        {icon}
      </div>
      <h3 className='font-semibold text-sm mb-1'>{title}</h3>
      <p className='text-xs text-muted-foreground'>{description}</p>
    </div>
  );
}
