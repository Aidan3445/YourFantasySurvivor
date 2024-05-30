import { headers } from "next/headers";
import { basicGet } from "~/app/api/fetchFunctions";


export default async function getSeasons() {
    const origin = headers().get("host");
    const url = new URL(`http://${origin}/api/seasons`);
    const res = await basicGet<string[]>(url);
    return res;
}
