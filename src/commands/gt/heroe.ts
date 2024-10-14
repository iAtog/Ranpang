import { Command, ChoiceType } from "../../class/Command.ts";
import { Client, CommandInteraction, AutocompleteInteraction } from "npm:discord.js";
import { Embed } from "npm:@notenoughupdates/discord.js-builders";
import { Heroe } from "../../lib/team/mod.ts";

class CMD extends Command {
    private heroColor: number[];

    constructor() {
        super({
            name: "hero",
            description: "Get heroe by name",
            choices: [
                {
                    type: ChoiceType.STRING,
                    name: "name",
                    description: "Name of the heroe",
                    required: true,
                    autocomplete: true
                }
            ]
        });
        this.heroColor = [0xed3f13, 0x2789e6, 0xd1b724];
    }

    // deno-lint-ignore no-unused-vars
    public async run(client: Client, interaction: CommandInteraction) {

        const heroName = interaction.options.get("name")?.value?.toString();

        const response = await fetch("https://www.gtales.top/api/heroes?hero=" + heroName);
        const dataRes = await response.json();

        if (dataRes.error || !dataRes) {
            interaction.reply({ content: "No se encontró el heroe `" + heroName + "`.", ephemeral: true });
            return;
        }

        if(dataRes.warning) {
            interaction.reply({ content: "El heroe `" + heroName + "` no está disponible aún.", ephemeral: true });
            return;
        }

        const data = dataRes as Heroe;

        const embed = new Embed()
            .setTitle(this.mayus(data.name))
            .setDescription("[Party] " + data.party)
            .setThumbnail("https://www.gtales.top/_next/image?url=%2Fassets%2Fheroes%2F" + data.atr + ".webp&w=256&q=75")
            .addFields(
                { name: "Role", value: this.mayus(data.role), inline: true },
                { name: "Collection", value: this.mayus(data.collection), inline: true },
                { name: "Element", value: this.mayus(data.element), inline: true },
                { name: "Rarity", value: this.mayus(data.rarity) + " star" + (parseInt(data.rarity) > 1 ? "s" : ""), inline: true },
                { name: "Available", value: data.available ? "Yes" : "No", inline: true }
            )
            //.setTimestamp(Date.now())
            .setFooter({ text: "Powered by gtales.top (only english) | " + data.stats.hp + " HP - " + data.stats.atk + " ATK - " + data.stats.def + " DEF" });
        
        embed.setColor(data.rarity === "ascend" ? 0x25d60d : this.heroColor[parseInt(data.rarity) - 1]);

        this.nonNull(data.na, () => embed.addFields({ name: "Normal Attack", value: data.na.title, inline: true }))
        this.nonNull(data.ability, () => embed.addFields({ name: "Ability", value: data.ability.title, inline: true }))
        this.nonNull(data.chain, () => embed.addFields({ name: "Chain", value: data.chain.title, inline: true }))
        this.nonNull(data.weapon, () => embed.addFields({ name: "Weapon", value: data.weapon.name, inline: true }))

        interaction.reply({ embeds: [embed] });
    }

    public override async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        await this.heroAutocomplete(interaction);
    }
}

export default CMD;