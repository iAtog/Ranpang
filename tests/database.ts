import { expect } from "jsr:@std/expect";
import LocalDatabase from "../src/lib/db/local/mod.ts";
import type { Database } from "../src/lib/db/mod.ts";
import type { Screenshot } from "../src/lib/team/mod.ts";
import { TeamGameMode } from "../src/lib/team/mod.ts";

let database: Database;

Deno.test("define database", () => {
    database = new LocalDatabase();
    expect(database).toBeDefined();
});

Deno.test("connect database", async() => {
    await database.connect();
    expect(await database.getAll()).toBeDefined();
});

Deno.test("add team", () => {
    const screenshots: Screenshot[] = [];
    screenshots.push({url: "test", name: "test"});
    
    database.set("test", {
        id: "etest1",
        description: "testing",
        gamemode: TeamGameMode.COLOSSEUM,
        members: [
            {key: "sia", name: "Sia"},
            {key: "sia", name: "Sia"},
            {key: "sia", name: "Sia"},
            {key: "sia", name: "Sia"}
        ],
        author: "Richard",
        createdAt: new Date(),
        screenshots
    });

    expect(database.get("test")).toBeDefined();
});

Deno.test("async check team", async() => {
    const team = await database.get("test");
    expect(team).toBeDefined();
    expect(team?.id).toBe("etest1");
});

Deno.test("async remove team", async() => {
    await database.remove("test");
    expect(await database.get("test")).toBeUndefined();
})

Deno.test("async close database", async() => {
    const closed = await database.close();
    expect(closed).toBe(true);
})