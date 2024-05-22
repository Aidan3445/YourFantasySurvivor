import { HoverCard, HoverCardTrigger, HoverCardContent } from "./commonUI/hover";
import CardContainer from "./cardContainer";

export default function SignInCard() {
    return (
        <CardContainer className="flex flex-col gap-4 p-4 text-black rounded-xl hover:bg-b4/50 transition-all">
            <h3 className="text-2xl font-bold indent-4">Sign in →</h3>
            <HoverCard>
                <HoverCardTrigger className="w-min">
                    <h4 className="text-xl font-semibold cursor-help text-nowrap">What is YFS?</h4>
                </HoverCardTrigger>
                <HoverCardContent className="text-2xl font-bold rounded-md border border-black bg-b2 font-serif text-black w-full" side="top">
                    <h1 className="text-nowrap">Your Fantasy Survivor</h1>
                </HoverCardContent>
            </HoverCard>
            <ul className="flex flex-col gap-2 text-base list-disc px-4">
                <li>Create or join a league</li>
                <li>Compete against friends</li>
                <li>Make your picks</li>
                <li>Add weekly, pre-season, and/or mid-season predictions</li>
                <li>
                    Completely cusomize your league's scoring system
                </li>
                <li>Crown a winner at the end of the season</li>
            </ul>
        </CardContainer>
    );
}
