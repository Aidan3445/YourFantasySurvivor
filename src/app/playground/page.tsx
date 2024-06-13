"use client";
import { useState } from "react";
import Rules from "./_components/rules";
import { defaultRules, type BaseEventRules } from "~/server/db/schema/leagues";
import { Leaderboard } from "./_components/leaderboard";

export default function PlaygroundPage() {
    const [rules, setRules] = useState<BaseEventRules>(defaultRules);

    return (
        <main>
            <h1 className="text-5xl font-bold text-black">Welcome to the fantasy playground!</h1>
            <section className="grid grid-cols-3 auto-rows-min gap-2">
                <Rules className="col-span-3" rules={rules} setRules={setRules} />
                <Leaderboard className="col-span-2" rules={rules} />
                <div> create league</div>
            </section>
        </main>
    );
}
