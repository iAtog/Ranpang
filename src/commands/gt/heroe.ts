import { Command, ChoiceType } from "../../class/Command.ts";
import { Client, CommandInteraction, AutocompleteInteraction } from "npm:discord.js";
import { Embed } from "npm:@notenoughupdates/discord.js-builders";

class CMD extends Command {
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
    }

    // deno-lint-ignore no-unused-vars
    public async run(client: Client, interaction: CommandInteraction) {
        
        const heroName = interaction.options.get("name")?.value?.toString();

        const response = await fetch("https://www.gtales.top/api/heroes?hero=" + heroName);
        const data = await response.json();

        if(data.error) {
            interaction.reply({ content: "No se encontró el heroe " + heroName });
            return;
        }

        const embed = new Embed()
            .setTitle(data.name)
            .setDescription(data.party)
            .setThumbnail("https://www.gtales.top/_next/image?url=%2Fassets%2Fheroes%2F" + data.atr + ".webp&w=256&q=75")
            .addFields(
                { name: "Role", value: this.mayus(data.role), inline: true },
                { name: "Collection", value: this.mayus(data.collection), inline: true }, 
            )
            .setFooter({ text: "Powered by gtales.top" });

        interaction.reply({ embeds: [embed] });
    }

    public override async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const focused = interaction.options.getFocused();
        const response = await fetch("https://www.gtales.top/api/heroes");
        const data: Heroe[] = await response.json();
        
        const filtered = data.filter(hero => hero.name.toLowerCase().startsWith(focused.toLowerCase()));
        let choices = filtered.map(choice => ({ name: choice.name, value: choice.key }));

        if(choices.length > 25) {
            choices  = choices.slice(0, 25);
        }

        interaction.respond(
            choices,
        ).catch(console.error);
    }

    public mayus(str: string) {
        let newStr = "";

        newStr += str.charAt(0).toUpperCase();
        newStr += str.slice(1);

        return newStr;
    }
}

interface Heroe {
    name: string;
    key: string;
}

export default CMD;