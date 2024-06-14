import '~/styles/globals.css';
import LeagueNav from './_components/leagueNav';
import { type ReactNode } from 'react';

export default function LeagueLayout({
  children,
}: {
    children: ReactNode;
}) {
  return (
    <main>
      <LeagueNav />
      {children}
    </main>
  );
}
