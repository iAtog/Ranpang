import * as discord from "npm:discord.js";

async function loadModules(client: discord.Client) {
    const commandModule = await import("./command/mod.ts");
    await commandModule.default.loadCommands(client);
}

export {
    loadModules
};