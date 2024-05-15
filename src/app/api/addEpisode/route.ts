import { db } from "~/server/db";
import { episodes } from "~/server/db/schema";

export async function POST(req: Request) {
    const episode = await req.json();
    await db.insert(episodes).values(episode).onConflictDoNothing();
    return Response.json({ message: "success" });
}
