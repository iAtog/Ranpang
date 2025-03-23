import { CommandInteraction, Client, AutocompleteInteraction } from "npm:discord.js";
import { SubcommandUtil } from "../lib/subcommand/mod.ts";
import { Embed } from "npm:@notenoughupdates/discord.js-builders";

abstract class SubcommandsClass {
    // deno-lint-ignore ban-types
    private subcommands: { [key: string]: {method: Function, restricted: boolean} };
    public util: SubcommandUtil;

    constructor() {
        this.subcommands = {};
        this.util = new SubcommandUtil();
    }

    // deno-lint-ignore ban-types
    public addSubcommand(subcommandName: string, method: Function, restricted: boolean = false): void {
        this.subcommands[subcommandName] = {method: method, restricted};
    }

    public async runSubcommand(name: string, client: Client, interaction: CommandInteraction): Promise<void> {
        const subcommand = this.subcommands[name];
        if (subcommand === undefined) return;
        const isAdmin = await this.util.hasPermission(interaction);
        if(subcommand.restricted && isAdmin) { 
            await this.notAdminMessage(interaction);
        } else {
            await subcommand.method(client, interaction, this.util);
        }
    }

    public async notAdminMessage(interaction: CommandInteraction) {
        const embed = new Embed()
        .setDescription(`:x: No tienes permisos para usar este comando.`)
        .setFooter({ text: "Ranpang", iconURL: "https://r2.e-z.host/a992a427-74c5-45d9-8edb-61722d83e2b4/r6taxujw.png" })
        .setColor(0xe30e4a)

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}

export default SubcommandsClass;