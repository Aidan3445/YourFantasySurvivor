import { SignInButton } from "@clerk/nextjs";

export default function SignInCard() {
    return (
        <SignInButton>
            <div className="flex flex-col gap-4 p-4 max-w-xs text-white rounded-xl bg-g2/80 hover:bg-g1/80"
                style={{ transition: 'background 0.2s' }}>
                <h3 className="text-2xl font-bold">Sign in →</h3>
                <div className="text-lg"> Create or join a league </div>
            </div>
        </SignInButton>
    );
}
