"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { SignedOut, SignedIn, SignInButton, UserButton } from "@clerk/nextjs";

type NavRoute = '/' | '/season' | '/league';
interface NavItemProps {
    href: NavRoute;
    label: string;
    isActive: boolean;
    onMouseEnter: () => void;
}

export default function TopNav() {
    const path = usePathname();
    const mainPath = `/${path.split('/')[1]}` as NavRoute;
    const [selected, setSelected] = useState<NavRoute>(mainPath);

    return (
        <nav className="flex justify-between items-center pt-4 font-semibold w-fill min-h-14" >
            <ul className="flex gap-4"
                onMouseLeave={() => setSelected(mainPath)}>
                <NavItem href="/" label="Home" isActive={selected === '/'}
                    onMouseEnter={() => setSelected('/')} />
                <NavItem href="/season" label="Seasons" isActive={selected === '/season'}
                    onMouseEnter={() => setSelected('/season')} />
                <NavItem href="/league" label="Leagues" isActive={selected === '/league'}
                    onMouseEnter={() => setSelected('/league')} />
            </ul>
            <div>
                <SignedOut>
                    <SignInButton />
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </div>
        </nav >
    );
};

function NavItem({ href, label, isActive, onMouseEnter }: NavItemProps) {

    return (
        <li className={` ${isActive ? '-translate-y-1' : ''}`}
            onMouseEnter={onMouseEnter}
            style={{ transition: 'transform 0.2s' }}>
            <a href={href}>{label}</a>
        </li>
    );
}

