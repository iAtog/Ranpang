import Bot from "./class/DiscordBot.ts";
import { Client, CommandInteraction, GatewayIntentBits, AutocompleteInteraction, ButtonInteraction, ActivityType } from "npm:discord.js@14.16.3";
import { expandGlob } from "https://deno.land/std@0.224.0/fs/expand_glob.ts";
import { REST } from 'npm:@discordjs/rest';
import { Routes } from 'npm:discord-api-types/v9';
import {Command} from "./class/Command.ts";

class Ranpang extends Bot {
    public cmds: string[] = [];

    constructor() {
        super(new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        }));
    }

    public override onLoad(): void {
        console.log("Bot loaded as " + this.client.user?.username + "#" + this.client.user?.discriminator);
        console.log("Currently connected to '" + this.database.databaseName() + "' database");

        this.client.user?.setPresence({
            activities: [{ name: `Heavenhold`, type: ActivityType.Watching }]
          });
    }

    public override async loadCommands(): Promise<void> {
        console.log("Loading commands");

        for await (const file of expandGlob("./src/commands/*/*.ts")) {
            if(!file.isFile) continue;
            const command = await import("file://" + file.path);
            if(!command.default) continue;
            const CommandClass: Command = new command.default();

            this.client.commands.set(CommandClass.settings.name, CommandClass);
            //console.log("Loaded command: " + CommandClass.settings.name);
        }

        this.registerCommands();
    }

    public override async registerCommands(): Promise<void> {
        const rest = new REST({ version: '9' }).setToken(Deno.env.get("DISCORD_TOKEN") ?? "");
        const cmds: object[] = [];
        // deno-lint-ignore no-explicit-any
        this.client.commands.forEach((exec: any, command: any) => {
            console.log("Registering (/) command: " + command);
            cmds.push(exec.parse());
        });

        try {
            console.log("Refreshing (/) commands");
            await rest.put(
                Routes.applicationCommands(Deno.env.get("BOT_ID") ?? "1294580912436281344"),
                { body: cmds }
            );
        } catch (error) {
            console.error('An error occurred while registering a (/) command:', error);
            return;
        }
    }

    public override async onInteraction(interaction: CommandInteraction | AutocompleteInteraction): Promise<void> {
        const commands = this.client.commands as Map<string, Command>
        if(interaction.isButton()) {
            this.buttonInteraction(interaction)
            return;
        }
        if(!commands.has(interaction.commandName)) return;

        const command: Command | undefined = commands.get(interaction.commandName);

        if(command === null || command === undefined) {
            console.log('[SEVERE] The command ' + interaction.commandName + ' was registered - however, no handler for it was found');
            return;
        }

        if(interaction.isAutocomplete()) {
            await command.autocomplete(interaction);
            return;
        }

        if(command.settings.restricted && interaction.user.id !== "660479309416235029") {
            interaction.reply({
                content: "Este comando está deshabilitado.",
                ephemeral: true
            })
            return;
        }

        command.run(this.client, interaction);
    }

    public async buttonInteraction(interaction: ButtonInteraction) {
        //const id = interaction.customId;
        
    }
}

new Ranpang().start();