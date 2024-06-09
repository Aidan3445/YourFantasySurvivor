import { type BaseEventRules } from "~/server/db/schema/leagues";
import { type Events } from "./query";

export default function compileScores(
    { castawayEvents, tribeEvents, tribeUpdates }: Events,
    rules: BaseEventRules
): Record<string, number[]> {
    const scores: Record<string, number[]> = {};

    // castaway events
    for (const { castaway, name, episode } of castawayEvents) {
        if (!scores[castaway]) {
            scores[castaway] = [];
        }

        const points = scores[castaway]!;

        switch (name) {
            case "indivWin":
            case "indivReward":
            case "tribe1st":
            case "tribe2nd":
            case "advFound":
            case "advPlay":
            case "badAdvPlay":
            case "advElim":
            case "spokeEpTitle":
            case "finalists":
            case "fireWin":
            case "soleSurvivor":
            case "elim":
            case "noVoteExit":
                points[episode] = (points[episode] ?? 0) + rules[name];
            default:
                break;
        }
    }

    // tribe events
    for (const { tribe, name, episode } of tribeEvents) {
        const castaways = tribeUpdates[episode]?.[tribe] ?? [];

        for (const castaway of castaways) {
            if (!scores[castaway]) {
                scores[castaway] = [];
            }

            const points = scores[castaway]!;

            switch (name) {
                case "tribe1st":
                    points[episode] = (points[episode] ?? 0) + rules.tribe1st;
                    break;
                case "tribe2nd":
                    points[episode] = (points[episode] ?? 0) + rules.tribe2nd;
                    break;
                default:
                    break;
            }
        }
    }
    return scores;
}
