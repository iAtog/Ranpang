
import {Command, ChoiceType} from "../../class/Command.ts";
import { Client, CommandInteraction } from "npm:discord.js";
import { Embed } from "npm:@notenoughupdates/discord.js-builders";
import { RaidUtil } from "../../lib/raid/mod.ts";

class Raid extends Command {
    public raidUtil: RaidUtil;

    constructor() {
        super({
            name: "raid",
            description: "Comando de raid",
            choices: [
                {
                    type: ChoiceType.SUB_COMMAND,
                    description: "Generar imagen de la raid actual.",
                    name: "imagen"
                },
                {
                    type: ChoiceType.SUB_COMMAND,
                    description: "Generar",
                    name: "team"
                }
            ]
        });
        this.raidUtil = new RaidUtil();
    }

    async run(client: Client, interaction: CommandInteraction) {
        if(interaction.options.data[0].name === "imagen") {
            await this.raidUtil.generateRaidImage(client, interaction);
        } else if(interaction.options.data[0].name === "team") {
            await this.raidUtil.buildTeamSvg(interaction);
        }
    }
}

export default Raid;