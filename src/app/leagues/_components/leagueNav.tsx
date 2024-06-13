export default function LeagueNav() {
    return (
        <nav className="flex justify-between items-center pt-4 font-semibold w-fill min-h-14" >
            <ul className="flex gap-4  text-black">
                <li><a href="/myLeagues">My Leagues</a></li>
                <li><a href="/create">Create League</a></li>
                <li><a href="/join">Join League</a></li>
            </ul>
        </nav>
    );
}

