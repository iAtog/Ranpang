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
}

interface ParsedCommand {
    name: string;
    description: string;
    options: CommandChoices[];
}

export { ChoiceType, Command };