import {Command, ChoiceType} from "../../class/Command.ts";
import { Client, CommandInteraction } from "npm:discord.js";
import { Embed } from "npm:@notenoughupdates/discord.js-builders";

class Help extends Command {
    constructor() {
        super({
            name: "info",
            description: "Información del bot",
        });
    }

    async run(client: Client, interaction: CommandInteraction) {
        //const commands = client.commands.map(command => command.name);
        let totalSeconds = (interaction.client.uptime / 1000);
        const days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        const hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);

        let uptimeText = "";

        if (days > 0) {
            uptimeText += days + "d ";
        }
        if (hours > 0) {
            uptimeText += hours + "h ";
        }
        if (minutes > 0) {
            uptimeText += minutes + "m ";
        }
        if (seconds > 0) {
            uptimeText += seconds + "s ";
        }

        const embed = new Embed()
        .setDescription(`Este bot está corriendo en **${client.guilds.cache.size}** servidores con **${client.users.cache.size}** usuarios.`)
        .setColor(0xe30e4a)
        .setTitle("Ranpang")
        .addFields({
            name: "Creado por",
            value: "Richard (iatog)",
            inline: true
        }, {
            name: "Runtime",
            value: "Deno v2.0.2",
            inline: true
        }, {
            name: "Tiempo encendido",
            value: uptimeText,
            inline: true
        }, {
            name: "Versión",
            value: "0.0.1",
            inline: true
        }, {
            name: "Versión de Discord.js",
            value: "14.16.3",
            inline: true
        }, {
            name: "Gremio afiliado",
            value: "Gremio `VultureSupremacy` en Guardian Tales.",
            inline: true
        })
        .setFooter({ text: interaction.user.username, iconURL: "https://r2.e-z.host/a992a427-74c5-45d9-8edb-61722d83e2b4/r6taxujw.png" })
        .setThumbnail("https://r2.e-z.host/a992a427-74c5-45d9-8edb-61722d83e2b4/ch84t1vn.png")
        .setTimestamp(Date.now());
        
        interaction.reply({ embeds: [embed] });
    }
}

export default Help;