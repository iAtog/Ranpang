import { Client, Collection, CommandInteraction } from "npm:discord.js@14.16.3";
import Command from "./Command.ts";

export default abstract class DiscordBot {
    //public commands: Collection<string, Command>;
    public client: Client;

    public abstract onLoad(): void;
    public abstract loadCommands(): void;
    public abstract registerCommands(): void;
    public abstract onInteraction(interaction: CommandInteraction): void;

    constructor(client: Client) {
        this.client = client;
        this.client.commands = new Collection<string, Command>();
    }

    public start() {
        this.client.on("ready", () => {
            this.onLoad();
        })
        
        this.loadCommands();

        this.client.on("interactionCreate", (interaction: any) => this.onInteraction(interaction)); 

        this.client.login(Deno.env.get("DISCORD_TOKEN") ?? "");
    }
}