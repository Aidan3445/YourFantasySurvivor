import { SignedIn, SignedOut } from "@clerk/nextjs";
import SignInCard from "./_components/signInCard";
import SeasonStats from "./_components/stats/seasonStats";
import getSeasons from "./api/seasons/fetch";

export default async function HomePage() {

    const seasons = await getSeasons();

    return (
        <main>
            <img src="https://i.imgur.com/b6cHcaG.png" alt="Header Image" className="w-full" />
            <div className="grid grid-cols-1 gap-4 pb-4 w-full sm:grid-cols-2 md:gap-8">
                <SignedOut>
                    <SignInCard />
                </SignedOut>
                <SignedIn>
                    <div> You are signed in! </div>
                </SignedIn>
                <SeasonStats seasons={seasons} />
            </div>
        </main >
    );
}
