import { db } from "~/server/db";
import { castaways } from "~/server/db/schema";

export async function POST(req: Request) {
    const castaway = await req.json();
    await db.insert(castaways).values(castaway).onConflictDoUpdate({
        target: [castaways.name, castaways.season],
        set: { photo: castaway.photo }
    });
    return Response.json({ message: "success" });
}
