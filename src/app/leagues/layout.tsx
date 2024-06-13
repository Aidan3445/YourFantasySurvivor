import "~/styles/globals.css";
import LeagueNav from "./_components/leagueNav";

export default function LeagueLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main>
            <LeagueNav />
            {children}
        </main>
    );
}
