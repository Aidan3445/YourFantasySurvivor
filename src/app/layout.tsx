import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import TopNav from "./_components/topNav";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
});

export const metadata = {
    title: "Your Fantasy Survivor",
    description: "The best place to play fantasy survivor",
    icons: [{ rel: "icon", url: "/icon.ico" }],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body className={`font-sans ${inter.variable}`}>
                    <div className="page">
                        <TopNav />
                        {children}
                    </div>
                </body>
            </html>
        </ClerkProvider>
    );
}
