import * as discord from "npm:discord.js";
import { expandGlob } from "https://deno.land/std@0.224.0/fs/expand_glob.ts";

async function loadCommands(client: discord.Client) {
    for await (const entry of expandGlob("./src/commands/*/*.ts")) {
        if(entry.isFile) {
            
            
        }
    }
}

export default {
    loadCommands
};
