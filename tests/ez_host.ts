import "jsr:@std/dotenv/load"

import EZHost from "../src/lib/e-z_host/mod.ts";
import type { EZHostResponse } from "../src/lib/e-z_host/mod.ts";
import { expect } from "jsr:@std/expect";
import { createTeamId } from "./../src/lib/team/mod.ts";
import fs from "node:fs";

const ezHost = new EZHost();

const testingImage = "https://i.imgur.com/MbBJtEv.jpeg";
const sessionId = createTeamId();
let imagePath: string;

Deno.test("downloading image", async() => {
    console.log(`[${sessionId}] Downloading image `);
    const imageExtension = "png"//testingImage.split(".").pop();
    const image = await ezHost.download(testingImage, imageExtension!, sessionId);
    console.log(`[${sessionId}] Image downloaded in ${image}`);
    imagePath = image;
    expect(imagePath).toBeDefined();
});

Deno.test("uploading image to custom host", async() => {
    console.log(`[${sessionId}] Uploading image to custom host`);
    const response = await ezHost.upload(imagePath!);
    if(!response) {
        console.log(`[${sessionId}] Error uploading image to custom host`);
    } else {
        console.log(`[${sessionId}] Image uploaded to custom host`);
        console.log(`[${sessionId}] URL: ${response.imageUrl}`);
    }
    console.log(response)
    expect(response.success).toBeTruthy();
});

Deno.test("deleting temporal image", () => {
    console.log(`[${sessionId}] Deleting temporal image`);
    ezHost.delete(imagePath!);
    expect(fs.existsSync(imagePath!)).toBeFalsy();
});