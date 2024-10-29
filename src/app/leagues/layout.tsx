import '~/styles/globals.css';
import { type ReactNode } from 'react';

export default function LeagueLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main>
      {children}
    </main>
  );
}
