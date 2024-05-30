import { type BaseEvent } from "~/server/db/schema/episodes";

type AdvantageStatus = "Active" | "Played" | "Misplayed" | "Eliminated";
export type AdvantageStat = { name: string, advName: string, status: AdvantageStatus };
export type CastawayChallengeStat = {
    name: string,
    indivWin: number,
    indivReward: number,
    tribe1st: number,
    tribe2nd: number
};
export type TribeChallengeStat = {
    name: string,
    tribe1st: number,
    tribe2nd: number
};
export type TitleStat = { name: string, count: number };
export type FinalStat = string[] | null;
export type FireWinStat = string | null;
export type SoleSurvivorStat = string | null;
export type EliminationStat = { name: string, episode: number, votes: string[] };

export type SeasonStats = {
    advantages: AdvantageStat[],
    titles: TitleStat[],
    castawayChallenges: CastawayChallengeStat[],
    tribeChallenges: TribeChallengeStat[],
    final: FinalStat,
    fireWin: FireWinStat,
    soleSurvivor: SoleSurvivorStat,
    eliminations: EliminationStat[]
}
export const emptyStats = (): SeasonStats => ({
    advantages: [],
    titles: [],
    castawayChallenges: [],
    tribeChallenges: [],
    final: null,
    fireWin: null,
    soleSurvivor: null,
    eliminations: [],
});


export default function compileStats(events: BaseEvent[]): SeasonStats {
    const stats: SeasonStats = emptyStats();

    events.forEach((event) => {
        switch (event.name) {
            case "advFound":
                event.castaways.forEach((name: string) => {
                    const castaway = stats.advantages.find((c) => c.name === name);
                    const status: AdvantageStatus = "Active";
                    if (!castaway) {
                        const newCastaway = { name, advName: "????", status };
                        stats.advantages.push(newCastaway);
                    } else {
                        stats.advantages.push({ name, advName: "????", status });
                    }
                });
                break;
            case "advPlay":
                event.castaways.forEach((name: string) => {
                    const castaway = stats.advantages.find((c) => c.name === name);
                    const status: AdvantageStatus = "Played";
                    if (!castaway) {
                        console.warn(`Castaway ${name} '${status}' an advantage they didn't find`);
                        const newCastaway = { name, advName: "????*", status };
                        stats.advantages.push(newCastaway);
                    } else {
                        const advIndex = stats.advantages.findIndex((a) =>
                            a.name === name && a.advName === "????" && a.status === "Active");
                        if (advIndex != -1) {
                            const adv = stats.advantages[advIndex];
                            if (adv) { // this check is unnecessary, but TypeScript doesn't know that
                                adv.status = status;
                                stats.advantages.push(...stats.advantages.splice(advIndex, 1));
                            }
                        } else {
                            console.warn(`Castaway ${name} '${status}' an advantage they didn't find`);
                            const newCastaway = { name, advName: "????*", status };
                            stats.advantages.push(newCastaway);
                        }
                    }
                });
                break;
            case "badAdvPlay":
                event.castaways.forEach((name: string) => {
                    const castaway = stats.advantages.find((c) => c.name === name);
                    const status: AdvantageStatus = "Misplayed";
                    if (!castaway) {
                        console.warn(`Castaway ${name} '${status}' an advantage they didn't find`);
                        const newCastaway = { name, advName: "????*", status };
                        stats.advantages.push(newCastaway);
                    } else {
                        const advIndex = stats.advantages.findIndex((a) =>
                            a.name === name && a.advName === "????" && a.status === "Active");
                        if (advIndex != -1) {
                            const adv = stats.advantages[advIndex];
                            if (adv) { // this check is unnecessary, but TypeScript doesn't know that
                                adv.status = status;
                                stats.advantages.push(...stats.advantages.splice(advIndex, 1));
                            }
                        } else {
                            console.warn(`Castaway ${name} '${status}' an advantage they didn't find`);
                            const newCastaway = { name, advName: "????*", status };
                            stats.advantages.push(newCastaway);
                        }
                    }
                });
                break;
            case "advElim":
                event.castaways.forEach((name: string) => {
                    const castaway = stats.advantages.find((c) => c.name === name);
                    const status: AdvantageStatus = "Eliminated";
                    if (!castaway) {
                        console.warn(`Castaway ${name} '${status}' an advantage they didn't find`);
                        const newCastaway = { name, advName: "????*", status };
                        stats.advantages.push(newCastaway);
                    }
                    else {
                        const advIndex = stats.advantages.findIndex((a) =>
                            a.name === name && a.advName === "????" && a.status === "Active");
                        if (advIndex != -1) {
                            const adv = stats.advantages[advIndex];
                            if (adv) { // this check is unnecessary, but TypeScript doesn't know that
                                adv.status = status;
                                stats.advantages.push(...stats.advantages.splice(advIndex, 1));
                            }
                        } else {
                            console.warn(`Castaway ${name} '${status}' an advantage they didn't find`);
                            const newCastaway = { name, advName: "????*", status };
                            stats.advantages.push(newCastaway);
                        }
                    }
                });
                break;
            case "spokeEpTitle":
                event.castaways.forEach((name: string) => {
                    const castaway = stats.titles.find((c) => c.name === name);
                    if (!castaway) {
                        const newCastaway = { name, count: 1 };
                        stats.titles.push(newCastaway);
                    } else {
                        castaway.count++;
                    }
                });
                break;
            case "tribe1st":
                event.tribes.forEach((name: string) => {
                    // check if tribe is already in the list
                    const tribe = stats.tribeChallenges.find((t) => t.name === name);
                    if (!tribe) {
                        // if not, add them and their challenge type
                        const newTribe = { name, tribe1st: 1, tribe2nd: 0 };
                        stats.tribeChallenges.push(newTribe);
                    } else {
                        // if they are, increment the challenge type
                        tribe.tribe1st++;
                    }
                });
                event.castaways.forEach((name: string) => {
                    // check if castaway is already in the list
                    const castaway = stats.castawayChallenges.find((c) => c.name === name);
                    if (!castaway) {
                        // if not, add them and their challenge type
                        const newCastaway = { name, tribe1st: 1, tribe2nd: 0, indivWin: 0, indivReward: 0 };
                        stats.castawayChallenges.push(newCastaway);
                    } else {
                        // if they are, increment the challenge type
                        castaway.tribe1st++;
                    }
                });
                break;
            case "tribe2nd":
                event.tribes.forEach((name: string) => {
                    // check if tribe is already in the list
                    const tribe = stats.tribeChallenges.find((t) => t.name === name);
                    if (!tribe) {
                        // if not, add them and their challenge type
                        const newTribe = { name, tribe1st: 0, tribe2nd: 1 };
                        stats.tribeChallenges.push(newTribe);
                    } else {
                        // if they are, increment the challenge type
                        tribe.tribe2nd++;
                    }
                });
                event.castaways.forEach((name: string) => {
                    // check if castaway is already in the list
                    const castaway = stats.castawayChallenges.find((c) => c.name === name);
                    if (!castaway) {
                        // if not, add them and their challenge type
                        const newCastaway = { name, tribe1st: 0, tribe2nd: 1, indivWin: 0, indivReward: 0 };
                        stats.castawayChallenges.push(newCastaway);
                    } else {
                        // if they are, increment the challenge type
                        castaway.tribe2nd++;
                    }
                });
                break;
            case "indivWin":
                event.castaways.forEach((name: string) => {
                    // check if castaway is already in the list
                    const castaway = stats.castawayChallenges.find((c) => c.name === name);
                    if (!castaway) {
                        // if not, add them and their challenge type
                        const newCastaway = { name, tribe1st: 0, tribe2nd: 0, indivWin: 1, indivReward: 0 };
                        stats.castawayChallenges.push(newCastaway);
                    } else {
                        // if they are, increment the challenge type
                        castaway.indivWin++;
                    }
                });
                break;
            case "indivReward":
                event.castaways.forEach((name: string) => {
                    // check if castaway is already in the list
                    const castaway = stats.castawayChallenges.find((c) => c.name === name);
                    if (!castaway) {
                        // if not, add them and their challenge type
                        const newCastaway = { name, tribe1st: 0, tribe2nd: 0, indivWin: 0, indivReward: 1 };
                        stats.castawayChallenges.push(newCastaway);
                    } else {
                        // if they are, increment the challenge type
                        castaway.indivReward++;
                    }
                });
                break;
            case "finalists":
                stats.final = event.castaways;
                break;
            case "fireWin":
                stats.fireWin = event.castaways[0] ?? null;
                break;
            case "soleSurvivor":
                stats.soleSurvivor = event.castaways[0] ?? null;
                break;
            case "elim":
                event.castaways.forEach((name: string) => {
                    const newElim = { name, episode: event.episode, votes: ["????"] };
                    stats.eliminations.push(newElim);
                });
                break;
            case "noVoteExit":
                event.castaways.forEach((name: string) => {
                    const newElim = { name, episode: event.episode, votes: [] };
                    stats.eliminations.push(newElim);
                });
                break;
            default:
                break;
        }
    });

    // sort the challenges using a weighted sum of the challenge types
    // individual wins are worth 4, individual rewards are worth 3, tribe wins are worth 2, and tribe 2nds are worth 1
    stats.castawayChallenges.sort((a, b) => {
        const aScore = a.indivWin * 4 + a.indivReward * 3 + a.tribe1st * 2 + a.tribe2nd;
        const bScore = b.indivWin * 4 + b.indivReward * 3 + b.tribe1st * 2 + b.tribe2nd;
        return bScore - aScore;
    });

    return stats;
}
