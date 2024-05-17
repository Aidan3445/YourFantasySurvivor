import { Episode } from "~/server/db/schema";

type AdvantageStatus = "Active" | "Played" | "Misplayed" | "Eliminated";
export type AdvantageStat = { castaway: string, name: string, status: AdvantageStatus };
export type ChallengeStat = {
    castaway: string,
    indivWin: number,
    indivReward: number,
    tribe1st: number,
    tribe2nd: number
};
export type TitleStat = { castaway: string, count: number };
export type FinalStat = string[] | null;
export type FireWinStat = string | null;
export type SoleSurvivorStat = string | null;
export type EliminationStat = { castaway: string, episode: number, votes: string[] };

export type SeasonStats = {
    advantages: AdvantageStat[],
    titles: TitleStat[],
    challenges: ChallengeStat[],
    final: FinalStat,
    fireWin: FireWinStat,
    soleSurvivor: SoleSurvivorStat,
    eliminations: EliminationStat[]
}
export const emptyStats = (): SeasonStats => ({
    advantages: [],
    titles: [],
    challenges: [],
    final: null,
    fireWin: null,
    soleSurvivor: null,
    eliminations: [],
});

export default function compileStats(episodes: Episode[]): SeasonStats {
    const stats: SeasonStats = emptyStats();

    episodes.forEach((episode) => {
        // advantages - broken to separate function for readability
        compileAdvs(episode, stats);

        // titles spoken
        episode.e_spokeEpTitle.forEach((name: string) => {
            const castaway = stats.titles.find((c) => c.castaway === name);
            if (!castaway) {
                var newCastaway = { castaway: name, count: 1 };
                stats.titles.push(newCastaway);
            } else {
                castaway.count++;
            }
        });

        // challenges - broken to separate function for readability
        compileChallenges(episode, stats);

        // final three
        if (episode.e_final.length > 0) {
            stats.final = episode.e_final;
        }

        // fire winner
        if (episode.e_fireWin.length > 0) {
            stats.fireWin = episode.e_fireWin[0] ?? null;
        }

        // sole survivor
        if (episode.e_soleSurvivor.length > 0) {
            stats.soleSurvivor = episode.e_soleSurvivor[0] ?? null;
        }

        // eliminations
        episode.e_elim.forEach((name: string) => {
            const newElim = { castaway: name, episode: episode.number, votes: ["????"] };
            stats.eliminations.push(newElim);
        });
        episode.e_noVoteExit.forEach((name: string) => {
            const newElim = { castaway: name, episode: episode.number, votes: [] };
            stats.eliminations.push(newElim);
        });
    });

    return stats;
}

function compileAdvs(episode: Episode, stats: SeasonStats) {
    episode.e_advFound.forEach((name: string) => {
        // check if castaway is already in the list
        const castaway = stats.advantages.find((c) => c.castaway === name);
        var status: AdvantageStatus = "Active";
        if (!castaway) {
            // if not, add them and their found advantage
            var newCastaway = { castaway: name, name: "????", status: status };
            stats.advantages.push(newCastaway);
        } else {
            // if they are, add the found advantage to their list
            stats.advantages.push({ castaway: name, name: "????", status: status });
        }
    });

    const advAction = (names: string[], newStatus: AdvantageStatus) => {
        names.forEach((name: string) => {
            // check if castaway is already in the list
            const castaway = stats.advantages.find((c) => c.castaway === name);
            if (!castaway) {
                // if not, add them and their played advantage
                // this indicates an advantage was given to them to play, or an error in the data
                console.warn(`Castaway ${name} played an advantage they didn't find`);
                // append an '*' to the name to indicate it was played without being found
                var newCastaway = { castaway: name, name: "????*", status: newStatus };
                stats.advantages.push(newCastaway);
            } else {
                // if they are, find the matching advantage
                const advIndex = stats.advantages.findIndex((a) =>
                    a.castaway === name && a.name === "????" && a.status === "Active");
                if (advIndex != -1) {
                    // if it exists, update the status and move to the back of the list
                    const adv = stats.advantages[advIndex];
                    if (adv) { // this check is unnecessary, but TypeScript doesn't know that
                        adv.status = newStatus;
                        stats.advantages.push(...stats.advantages.splice(advIndex, 1));
                    }
                } else {
                    // if it doesn't, add a new played advantage
                    // this indicates an advantage was given to them to play, or an error in the data
                    console.warn(`Castaway ${name} '${newStatus}' an advantage they didn't find`);
                    // append an '*' to the name to indicate it was played without being found
                    var newCastaway = { castaway: name, name: "????*", status: newStatus };
                    stats.advantages.push(newCastaway);
                }
            }
        });
    }

    advAction(episode.e_advPlay, "Played");
    advAction(episode.e_badAdvPlay, "Misplayed");
    advAction(episode.e_advElim, "Eliminated");
    // reverse the order of the advantages list so that the most recent advantage updates are first
    stats.advantages.reverse();
}

function compileChallenges(episode: Episode, stats: SeasonStats) {
    const addChallenges = (names: string[], type: "tribe1st" | "tribe2nd" | "indivWin" | "indivReward") => {
        names.forEach((name: string) => {
            // check if castaway is already in the list
            const castaway = stats.challenges.find((c) => c.castaway === name);
            if (!castaway) {
                // if not, add them and their challenge type
                var newCastaway = { castaway: name, indivWin: 0, indivReward: 0, tribe1st: 0, tribe2nd: 0 };
                newCastaway[type] = 1;
                stats.challenges.push(newCastaway);
            } else {
                // if they are, increment the challenge type
                castaway[type]++;
            }
        });
    }

    addChallenges(episode.e_tribe1st, "tribe1st");
    addChallenges(episode.e_tribe2nd, "tribe2nd");
    addChallenges(episode.e_indivWin, "indivWin");
    addChallenges(episode.e_indivReward, "indivReward");

    // sort the challenge stats by a weighted score where:
    // indivWin = 4, indivReward = 3, tribe1st = 2, tribe2nd = 1
    stats.challenges.sort((a, b) => {
        const aScore = a.indivWin * 4 + a.indivReward * 3 + a.tribe1st * 2 + a.tribe2nd;
        const bScore = b.indivWin * 4 + b.indivReward * 3 + b.tribe1st * 2 + b.tribe2nd;
        return bScore - aScore;
    });
}
