"use client";
import { useState } from "react";
import Rules from "./_components/rules";
import { type BaseEventRules } from "~/server/db/schema/leagues";

export default function PlaygroundPage() {
    const [rules, setRules] = useState<BaseEventRules>();

    return (
        <main>
            <h1 className="text-5xl font-bold text-black">Welcome to the fantasy playground!</h1>
            <section className="grid grid-cols-3 grid-rows-2 gap-2">
                <Rules className="col-span-2 row-span-2" rules={rules} setRules={setRules} />
                <div>Leaderboard</div>
                <div> create league</div>
            </section>
        </main>
    );
}
