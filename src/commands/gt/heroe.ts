import { Command, ChoiceType } from "../../class/Command.ts";
import { Client, CommandInteraction, AutocompleteInteraction } from "npm:discord.js";
import { Embed } from "npm:@notenoughupdates/discord.js-builders";
import { Heroe } from "../../lib/team/mod.ts";
import { TeamsHandler } from "../../lib/team/mod.ts";

class CMD extends Command {
    private heroColor: number[];

    constructor() {
        super({
            name: "heroe",
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

    public async run(client: Client, interaction: CommandInteraction) {
        const handler = client.teams as TeamsHandler;
        const heroName = interaction.options.get("name")?.value?.toString();

        const hero = await handler.getHero(heroName!);
        if (hero === undefined) {
            interaction.reply({ content: "No hay información de `" + heroName + "` en **gtales.top**.", ephemeral: true });
            return;
        }

        // deno-lint-ignore no-explicit-any
        if((hero as unknown as any).warning!) {
            interaction.reply({ content: "No hay información de `" + heroName + "` en **gtales.top**.", ephemeral: true });
            return;
        }

        const embed = new Embed()
            .setTitle(this.mayus(hero.name))
            .setDescription("[Party] " + hero.party)
            .setThumbnail("https://www.gtales.top/_next/image?url=%2Fassets%2Fheroes%2F" + hero.atr + ".webp&w=256&q=75")
            .addFields(
                { name: "Role", value: this.mayus(hero.role), inline: true },
                { name: "Collection", value: this.mayus(hero.collection), inline: true },
                { name: "Element", value: this.mayus(hero.element), inline: true },
                { name: "Rarity", value: this.mayus(hero.rarity) + " star" + (parseInt(hero.rarity) > 1 ? "s" : ""), inline: true },
                { name: "Available", value: hero.available ? "Yes" : "No", inline: true }
            )
            //.setTimestamp(Date.now())
            .setFooter({ text: "Powered by gtales.top (only english) | " + hero.stats.hp + " HP - " + hero.stats.atk + " ATK - " + hero.stats.def + " DEF" });
        
        embed.setColor(hero.rarity === "ascend" ? 0x25d60d : this.heroColor[parseInt(hero.rarity) - 1]);

        this.nonNull(hero.na, () => embed.addFields({ name: "Normal Attack", value: hero.na.title, inline: true }))
        this.nonNull(hero.ability, () => embed.addFields({ name: "Ability", value: hero.ability.title, inline: true }))
        this.nonNull(hero.chain, () => embed.addFields({ name: "Chain", value: hero.chain.title, inline: true }))
        this.nonNull(hero.weapon, () => embed.addFields({ name: "Weapon", value: hero.weapon.name, inline: true }))

        interaction.reply({ embeds: [embed] });
    }

    public override async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        await this.heroAutocomplete(interaction);
    }
}

export default CMD;