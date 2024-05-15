const origin = process.env.ORIGIN;

export default async function getEpisodes(season?: string) {
    const url = new URL(`http://${origin}/api/episodes`);
    if (season) {
        url.searchParams.set("season", season);
    }
    const res = await fetch(url.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    const eps = await res.json();
    return eps;
}
