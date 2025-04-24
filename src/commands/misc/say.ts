import {Command, ChoiceType} from "../../class/Command.ts";
import { Client, CommandInteraction, Interaction, TextChannel } from "npm:discord.js";
import { Embed } from "npm:@notenoughupdates/discord.js-builders";

class Help extends Command {
    constructor() {
        super({
            name: "proof",
            description: "Información del bot",
            restricted: true,
            choices: [
                {
                    type: ChoiceType.STRING,
                    name: "m",
                    description: "what",
                },
                {
                    type: ChoiceType.CHANNEL,
                    name: "c",
                    description: "ch",
                }
            ]
        });
    }

    async run(client: Client, interaction: CommandInteraction) {
        try {
            const channel = interaction.options.get("c")?.channel as TextChannel;
            const message = interaction.options.get("m")?.value;

            if(!channel || !message) {
                interaction.reply({ content: ":x: Debes especificar un mensaje y un canal.", ephemeral: true });
                return;
            }

            await channel.send(message.toString());
            interaction.reply({ content: ":white_check_mark: Mensaje enviado.", ephemeral: true });
        } catch(err) {
            console.error(err);
            interaction.reply({ content: ":x: Ocurrió un error al ejecutar el comando, por favor intenta nuevamente: " + err, ephemeral: true });
        }
    }
}

export default Help;