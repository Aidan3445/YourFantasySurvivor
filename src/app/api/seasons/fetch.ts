import { basicGet } from "../fetchFunctions";

const origin = process.env.ORIGIN;

export default async function getSeasons() {
    const url = new URL(`http://${origin}/api/seasons`);
    const res = await basicGet<string[]>(url);
    return res;
}
