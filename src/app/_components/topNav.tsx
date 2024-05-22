import { SignedOut, SignedIn, SignInButton, UserButton, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { LoaderCircle } from "lucide-react";

type NavRoute = '/' | '/season' | '/league';
interface NavItemProps {
    path: NavRoute;
    label: string;
}

export default function TopNav() {

    return (
        <nav className="flex justify-between items-center pt-4 font-semibold w-fill min-h-14" >
            <ul className="flex gap-4">
                <NavItem path="/" label="Home" />
                <NavItem path="/season" label="Seasons" />
                <NavItem path="/league" label="Leagues" />
            </ul>
            <div>
                <ClerkLoading>
                    <LoaderCircle className="animate-spin" size={24} />
                </ClerkLoading>
                <ClerkLoaded>
                    <SignedOut>
                        <SignInButton />
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </ClerkLoaded>
            </div>
        </nav >
    );
};

function NavItem({ path, label }: NavItemProps) {

    return (
        <li className="hover:-translate-y-1"
            style={{ transition: 'transform 0.2s' }}>
            <a href={path}>{label}</a>
        </li >
    );
}

