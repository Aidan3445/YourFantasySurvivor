import { type CastawayEvent } from "./route";

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


export default function compileStats(events: CastawayEvent[]): SeasonStats {
    const stats: SeasonStats = emptyStats();

    events.forEach((event) => {
        const castawayName = event.castaway;

        switch (event.name) {
            case "advFound": {
                const castaway = stats.advantages.find((c) => c.name === castawayName);
                const status: AdvantageStatus = "Active";
                if (!castaway) {
                    const newCastaway = { name: castawayName, advName: "????", status };
                    stats.advantages.push(newCastaway);
                } else {
                    stats.advantages.push({ name: castawayName, advName: "????", status });
                }
                break;
            }
            case "advPlay": {
                const castaway = stats.advantages.find((c) => c.name === castawayName);
                const status: AdvantageStatus = "Played";
                if (!castaway) {
                    console.warn(`Castaway ${castawayName} '${status}' an advantage they didn't find`);
                    const newCastaway = { name: castawayName, advName: "????*", status };
                    stats.advantages.push(newCastaway);
                } else {
                    const advIndex = stats.advantages.findIndex((a) =>
                        a.name === castawayName && a.advName === "????" && a.status === "Active");
                    if (advIndex != -1) {
                        const adv = stats.advantages[advIndex];
                        if (adv) { // this check is unnecessary, but TypeScript doesn't know that
                            adv.status = status;
                            stats.advantages.push(...stats.advantages.splice(advIndex, 1));
                        }
                    } else {
                        console.warn(`Castaway ${castawayName} '${status}' an advantage they didn't find`);
                        const newCastaway = { name: castawayName, advName: "????*", status };
                        stats.advantages.push(newCastaway);
                    }
                }
                break;
            }
            case "badAdvPlay": {
                const castaway = stats.advantages.find((c) => c.name === castawayName);
                const status: AdvantageStatus = "Misplayed";
                if (!castaway) {
                    console.warn(`Castaway ${castawayName} '${status}' an advantage they didn't find`);
                    const newCastaway = { name: castawayName, advName: "????*", status };
                    stats.advantages.push(newCastaway);
                } else {
                    const advIndex = stats.advantages.findIndex((a) =>
                        a.name === castawayName && a.advName === "????" && a.status === "Active");
                    if (advIndex != -1) {
                        const adv = stats.advantages[advIndex];
                        if (adv) { // this check is unnecessary, but TypeScript doesn't know that
                            adv.status = status;
                            stats.advantages.push(...stats.advantages.splice(advIndex, 1));
                        }
                    } else {
                        console.warn(`Castaway ${castawayName} '${status}' an advantage they didn't find`);
                        const newCastaway = { name: castawayName, advName: "????*", status };
                        stats.advantages.push(newCastaway);
                    }
                }
            };
                break;
            case "advElim": {
                const castaway = stats.advantages.find((c) => c.name === castawayName);
                const status: AdvantageStatus = "Eliminated";
                if (!castaway) {
                    console.warn(`Castaway ${castawayName} '${status}' an advantage they didn't find`);
                    const newCastaway = { name: castawayName, advName: "????*", status };
                    stats.advantages.push(newCastaway);
                }
                else {
                    const advIndex = stats.advantages.findIndex((a) =>
                        a.name === castawayName && a.advName === "????" && a.status === "Active");
                    if (advIndex != -1) {
                        const adv = stats.advantages[advIndex];
                        if (adv) { // this check is unnecessary, but TypeScript doesn't know that
                            adv.status = status;
                            stats.advantages.push(...stats.advantages.splice(advIndex, 1));
                        }
                    } else {
                        console.warn(`Castaway ${castawayName} '${status}' an advantage they didn't find`);
                        const newCastaway = { name: castawayName, advName: "????*", status };
                        stats.advantages.push(newCastaway);
                    }
                }
            };
                break;
            case "spokeEpTitle": {
                const castaway = stats.titles.find((c) => c.name === castawayName);
                if (!castaway) {
                    const newCastaway = { name: castawayName, count: 1 };
                    stats.titles.push(newCastaway);
                } else {
                    castaway.count++;
                }
            };
                break;
            case "tribe1st": {
                // check if castaway is already in the list
                const castaway = stats.castawayChallenges.find((c) => c.name === castawayName);
                if (!castaway) {
                    // if not, add them and their challenge type
                    const newCastaway = { name: castawayName, tribe1st: 1, tribe2nd: 0, indivWin: 0, indivReward: 0 };
                    stats.castawayChallenges.push(newCastaway);
                } else {
                    // if they are, increment the challenge type
                    castaway.tribe1st++;
                }
            };
                break;
            case "tribe2nd": {
                // check if castaway is already in the list
                const castaway = stats.castawayChallenges.find((c) => c.name === castawayName);
                if (!castaway) {
                    // if not, add them and their challenge type
                    const newCastaway = { name: castawayName, tribe1st: 0, tribe2nd: 1, indivWin: 0, indivReward: 0 };
                    stats.castawayChallenges.push(newCastaway);
                } else {
                    // if they are, increment the challenge type
                    castaway.tribe2nd++;
                }
            };
                break;
            case "indivWin": {
                // check if castaway is already in the list
                const castaway = stats.castawayChallenges.find((c) => c.name === castawayName);
                if (!castaway) {
                    // if not, add them and their challenge type
                    const newCastaway = { name: castawayName, tribe1st: 0, tribe2nd: 0, indivWin: 1, indivReward: 0 };
                    stats.castawayChallenges.push(newCastaway);
                } else {
                    // if they are, increment the challenge type
                    castaway.indivWin++;
                }
            };
                break;
            case "indivReward": {
                // check if castaway is already in the list
                const castaway = stats.castawayChallenges.find((c) => c.name === castawayName);
                if (!castaway) {
                    // if not, add them and their challenge type
                    const newCastaway = { name: castawayName, tribe1st: 0, tribe2nd: 0, indivWin: 0, indivReward: 1 };
                    stats.castawayChallenges.push(newCastaway);
                } else {
                    // if they are, increment the challenge type
                    castaway.indivReward++;
                }
            };
                break;
            case "finalists":
                stats.final?.push(event.castaway) ?? (stats.final = [event.castaway]);
                break;
            case "fireWin":
                stats.fireWin = event.castaway;
                break;
            case "soleSurvivor":
                stats.soleSurvivor = event.castaway;
                break;
            case "elim": {
                const newElim = { name: castawayName, episode: event.episode, votes: ["????"] };
                stats.eliminations.push(newElim);
            };
                break;
            case "noVoteExit": {
                const newElim = { name: castawayName, episode: event.episode, votes: [] };
                stats.eliminations.push(newElim);
            };
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

    // sort the tribe challenges by tribe wins with a weighted sum of tribe 1sts and 2nds
    stats.tribeChallenges.sort((a, b) => {
        const aScore = a.tribe1st * 2 + a.tribe2nd;
        const bScore = b.tribe1st * 2 + b.tribe2nd;
        return bScore - aScore;
    });

    // sort the titles by count
    stats.titles.sort((a, b) => b.count - a.count);

    // sort the eliminations by episode
    stats.eliminations.sort((a, b) => a.episode - b.episode);

    return stats;
}
