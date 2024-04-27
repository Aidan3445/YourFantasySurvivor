import "~/styles/globals.css";

import { Inter } from "next/font/google";
import TopNav from "./components/topNav";

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
        <html lang="en">
            <body className={`font-sans ${inter.variable}`}>
                <TopNav />
                {children}
            </body>
        </html>
    );
}
