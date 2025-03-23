import { Client, Collection, CommandInteraction } from "npm:discord.js@14.16.3";
import { Command } from "./Command.ts";
import { Database, DatabaseName, loadDatabase } from "../lib/db/mod.ts";
import { TeamsHandler } from "../lib/team/mod.ts";
import EZ_Host from "../lib/e-z_host/mod.ts";
import ColiseoSubCommand from "../commands/sub/coliseo/mod.ts";


export default abstract class DiscordBot {
    //public commands: Collection<string, Command>;
    public client: Client;
    public database: Database = undefined!;
    public EZ_Host: EZ_Host = undefined!;
    public teams: TeamsHandler = undefined!;
    public coliseoSubcommands: ColiseoSubCommand = undefined!;

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
        this.client.ez_api = new EZ_Host();
        this.client.coliseoSubcommands = new ColiseoSubCommand(this.client);
        
        // Meme reaction
        this.client.on("messageCreate", message => {
            if(message.author.id === "235148962103951360" &&
                message.guild?.id === "1181755080404373594" &&
                message.channel.id === "1255483504465285120") {
                message.react("1323118392022007870");
            }
        });

        this.client.login(Deno.env.get("DISCORD_TOKEN") ?? "");
    }
}