// deno-lint-ignore-file
import { CommandInteraction, Client, AutocompleteInteraction } from "npm:discord.js";
import { TeamsHandler, TeamGameMode, TeamType } from "../lib/team/mod.ts";

abstract class Command {
    public settings: CommandSettings;
    
    constructor(settings: CommandSettings) {
        this.settings = settings;
    }

    public abstract run(client: Client, interaction: CommandInteraction): void;

    // deno-lint-ignore no-unused-vars
    public autocomplete(interaction: AutocompleteInteraction) {
        throw new Error("Method not implemented.");
    }

    public parse(): ParsedCommand {
        return {
            name: this.settings.name,
            description: this.settings.description,
            options: this.settings.choices ?? []
        }
    }

    public mayus(str: string) {
        let newStr = "";

        newStr += str.charAt(0).toUpperCase();
        newStr += str.slice(1);

        return newStr;
    }

    public async heroAutocomplete(interaction: AutocompleteInteraction, blacklist = []): Promise<void> {
        const focused = interaction.options.getFocused();
        const data = await (interaction.client.teams as TeamsHandler).getCustomHeros();
        const blacklistedKeys: string[] = [...blacklist];
        const filtered = data.filter(hero => hero.name.toLowerCase().includes(focused.toLowerCase()) && !blacklistedKeys.includes(hero.key));
        let choices = filtered.map(choice => ({ name: this.mayus(choice.name), value: choice.key }));
        
        if(choices.length > 25) {
            choices = choices.slice(0, 25);
        }

        interaction.respond(
            choices,
        ).catch(console.error);
    }

    public async gamemodeAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const focused = interaction.options.getFocused(true);
        const gamemodes = [TeamGameMode.COLOSSEUM, TeamGameMode.RAID, TeamGameMode.TETIS];
        const filtered = gamemodes.filter(gamemode => gamemode.toString().toLowerCase().includes(focused.value.toString().toLowerCase()));
        
        let choices = filtered.map(gamemode => ({ name: this.mayus(gamemode), value: gamemode.toUpperCase() }))

        if(choices.length > 25) {
            choices = choices.slice(0, 25);
        }

        interaction.respond(choices)
            .catch(console.error);
    }

    public async typeAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const focused = interaction.options.getFocused(true);
        const gamemodes = [TeamType.COUNTERS, TeamType.PRESET];
        const filtered = gamemodes.filter(gamemode => gamemode.toString().toLowerCase().includes(focused.value.toString().toLowerCase()));
        
        let choices = filtered.map(gamemode => ({ name: gamemode, value: gamemode.toUpperCase() }))

        if(choices.length > 25) {
            choices = choices.slice(0, 25);
        }

        interaction.respond(choices)
            .catch(console.error);
    }

    public nonNull(value: any, thing: Function): void {
        if(value !== null) thing()
    }
}

enum ChoiceType {
    SUB_COMMAND = 1,
    SUB_COMMAND_GROUP = 2,
    STRING = 3,
    INTEGER = 4,
    BOOLEAN = 5,
    USER = 6,
    CHANNEL = 7,
    ROLE = 8,
    MENTIONABLE = 9,
    NUMBER = 10,
    ATTACHMENT = 11
}

interface Heroe {
    name: string;
    key: string;
}

interface CommandSettings {
    name: string;
    description: string;
    choices?: CommandChoices[];
    restricted?: boolean;
    admin?: boolean;
}

interface CommandChoices {
    type: ChoiceType;
    name: string;
    description: string;
    required?: boolean;
    autocomplete?: boolean;
    options?: CommandChoices[];
}

interface ParsedCommand {
    name: string;
    description: string;
    options: CommandChoices[];
}

export { ChoiceType, Command };