import { SignedOut, SignedIn, SignInButton, UserButton, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { LoaderCircle } from "lucide-react";

type NavRoute = '/' | '/playground' | '/league';
interface NavItemProps {
    path: NavRoute;
    label: string;
}

export default function TopNav() {

    return (
        <nav className="flex justify-between items-center pt-4 font-semibold w-fill min-h-14" >
            <ul className="flex gap-4">
                <NavItem path="/" label="Home" />
                <NavItem path="/playground" label="Playground" />
                <NavItem path="/league" label="Leagues" />
            </ul>
            <div className="flex justify-center items-center">
                <ClerkLoading>
                    <LoaderCircle className="self-center animate-spin" size={32} />
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
        <li className="duration-200 hover:-translate-y-1">
            <a href={path}>{label}</a>
        </li >
    );
}

