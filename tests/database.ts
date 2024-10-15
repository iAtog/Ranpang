import "jsr:@std/dotenv/load"

import { expect } from "jsr:@std/expect";
import _LocalDatabase from "../src/lib/db/local/mod.ts";
import MongoDB from "../src/lib/db/mongodb/mod.ts";
import type { Database } from "../src/lib/db/mod.ts";
import type { Screenshot } from "../src/lib/team/mod.ts";
import { TeamGameMode } from "../src/lib/team/mod.ts";

let database: Database;

Deno.test("define database", () => {
    database = new MongoDB();
    expect(database).toBeDefined();
});

Deno.test("connect database", async() => {
    await database.connect();
    expect(database.isConnected()).toBeTruthy();
});

Deno.test("add team", async() => {
    await database.set("etest1", {
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
        screenshots: [{url: "test", name: "test"}]
    });

    expect(database.get("etest1")).toBeDefined();
});

Deno.test("async check team", async() => {
    const team = await database.get("etest1");
    expect(team?.id).toBe("etest1");
});
/*
Deno.test("async remove team", async() => {
    await database.remove("test");
    expect(await database.get("test")).toBeUndefined();
})*/

Deno.test("async close database", async() => {
    const closed = await database.close();
    expect(closed).toBe(true);
})