import { db } from "~/server/db";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default async function HomePage() {
    return (
        <main>
            <img src="https://i.imgur.com/b6cHcaG.png" alt="Header Image" className="w-full" />
            <SignedOut>
                <div>
                    <h1>Home Page</h1>
                    <p>Welcome to the Survivor Fantasy League</p>
                    <p> Please sign in: <SignInButton /> </p>
                </div>
            </SignedOut>
            <SignedIn>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
                    <a className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
                        href="/season" >
                        <h3 className="text-2xl font-bold">Season →</h3>
                        <div className="text-lg"> View the current season of Survivor </div>
                    </a>
                    <a className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
                        href="/league" >
                        <h3 className="text-2xl font-bold">League →</h3>
                        <div className="text-lg"> View the current league of Survivor </div>
                    </a>
                </div>
            </SignedIn>
        </main >
    );
}
