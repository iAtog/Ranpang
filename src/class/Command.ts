import { CommandInteraction, Client, AutocompleteInteraction } from "npm:discord.js";

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

    public async heroAutocomplete(interaction: any): Promise<void> {
        const focused = interaction.options.getFocused();
        const response = await fetch("https://www.gtales.top/api/heroes");
        const data: Heroe[] = await response.json();
        
        const filtered = data.filter(hero => hero.name.toLowerCase().startsWith(focused.toLowerCase()));
        let choices = filtered.map(choice => ({ name: this.mayus(choice.name), value: choice.key }));

        if(choices.length > 25) {
            choices = choices.slice(0, 25);
        }

        interaction.respond(
            choices,
        ).catch(console.error);
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
    restricted?: boolean
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