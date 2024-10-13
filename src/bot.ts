import Bot from "./class/DiscordBot.ts";
import { Client, CommandInteraction, GatewayIntentBits } from "npm:discord.js@14.16.3";
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
    }

    public override async loadCommands(): Promise<void> {
        console.log("Loading commands");

        for await (const file of expandGlob("./src/commands/*")) {
            const command = await import("./commands/" + file.name);

            const CommandClass: Command = new command.default();

            this.client.commands.set(CommandClass.settings.name, CommandClass);
        }

        this.registerCommands();
    }

    public override async registerCommands(): Promise<void> {
        const rest = new REST({ version: '9' }).setToken(Deno.env.get("DISCORD_TOKEN") ?? "");
        const cmds: object[] = [];
        this.client.commands.forEach((exec: Command, command: string) => {
            console.log("Registering (/) command: " + command);
            cmds.push(exec.parse());
            //console.log(exec.parse())
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

    public override async onInteraction(interaction: CommandInteraction): Promise<void> {
        if(!this.client.commands.has(interaction.commandName)) return;

        const command: Command = this.client.commands.get(interaction.commandName);

        if(command === null) {
            console.log('[SEVERE] The command ' + interaction.commandName + ' was registered - however, no handler for it was found');
            return;
        }

        if(interaction.type == 'APPLICATION_COMMAND_AUTOCOMPLETE') {
            await command.autocomplete(interaction);
            return;
        }

        if(command.settings.restricted && interaction.user.id !== "660479309416235029") {
            interaction.reply({
                content: "Este comando está deshabilitado temporalmente o restringido",
                ephemeral: true
            })
            return;
        }

        command.run(this.client, interaction);
    }
}

new Ranpang().start();