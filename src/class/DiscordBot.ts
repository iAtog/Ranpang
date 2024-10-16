import { Client, Collection, CommandInteraction } from "npm:discord.js@14.16.3";
import { Command } from "./Command.ts";
import { Database, DatabaseName, loadDatabase } from "../lib/db/mod.ts";
import { TeamsHandler } from "../lib/team/mod.ts";


export default abstract class DiscordBot {
    //public commands: Collection<string, Command>;
    public client: Client;
    public database: Database = undefined!;

    public abstract onLoad(): void;
    public abstract loadCommands(): void;
    public abstract registerCommands(): void;
    public abstract onInteraction(interaction: CommandInteraction): void;

    constructor(client: Client) {
        this.client = client;
        this.client.commands = new Collection<string, Command>();
    }

    public async start(): Promise<void> {
        console.log("Loading database, this may take a while...");
        this.database = await loadDatabase(DatabaseName.MONGODB);
        await this.database.connect();

        this.client.on("ready", () => {
            this.onLoad();
        })

        this.loadCommands();

        this.client.on("interactionCreate", (interaction: any) => this.onInteraction(interaction));

        this.client.database = this.database;
        this.client.teams = new TeamsHandler(this.database);

        this.client.login(Deno.env.get("DISCORD_TOKEN") ?? "");
    }
}