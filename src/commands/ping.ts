import {Command, ChoiceType} from "../class/Command.ts";
import { Message, Client, CommandInteraction } from "npm:discord.js";
import { Embed } from "npm:@notenoughupdates/discord.js-builders";

class Help extends Command {
    constructor() {
        super({
            name: "ping",
            description: "Pings the bot",
            restricted: true,
            choices: [
                {
                    type: ChoiceType.BOOLEAN,
                    name: "yes",
                    description: "Cookies"
                }
            ]
        });
    }

    async run(client: Client, interaction: CommandInteraction) {
        //const commands = client.commands.map(command => command.name);
        const embed = new Embed()
            .setTitle("Commands")
            .setDescription("hi");
        
        interaction.reply({ embeds: [embed] });
    }
}

export default Help;