const origin = process.env.ORIGIN;

export default async function getSeasons() {
    const url = new URL(`http://${origin}/api/seasons`);
    const res = await fetch(url.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    const szns = await res.json();
    return szns;
}
