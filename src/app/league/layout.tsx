import "~/styles/globals.css";

export default function LeagueLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main>{children}</main>
    );
}
