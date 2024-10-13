import {Command, ChoiceType} from "../../class/Command.ts";
import { Client, CommandInteraction } from "npm:discord.js";
import { Embed } from "npm:@notenoughupdates/discord.js-builders";

class Help extends Command {
    constructor() {
        super({
            name: "team",
            description: "Build and counters",
            restricted: true,
            choices: [
                {
                    type: ChoiceType.SUB_COMMAND,
                    name: "counter",
                    description: "Counters",
                    options: [
                        {
                            type: ChoiceType.STRING,
                            name: "leader",
                            description: "Lider del grupo",
                            required: true,
                            autocomplete: true
                        },
                        {
                            type: ChoiceType.STRING,
                            name: "member2",
                            description: "Primer miembro",
                            required: true,
                            autocomplete: true
                        },
                        {
                            type: ChoiceType.STRING,
                            name: "member3",
                            description: "Tercer miembro",
                            required: true,
                            autocomplete: true
                        },
                        {
                            type: ChoiceType.STRING,
                            name: "member4",
                            description: "Cuarto miembro",
                            required: true,
                            autocomplete: true
                        },
                    ]
                }
            ]
        });
    }

    async run(client: Client, interaction: CommandInteraction) {
        //const commands = client.commands.map(command => command.name);
        const embed = new Embed()
            .setTitle("Commands")
            .setDescription("hi");
        if(interaction.options.data[0].name === "counter") {
            const counter = interaction.options.data[0].options;
            if(!counter) {
                interaction.reply({ content: "Error: No se encontró el grupo" });
                return;
            };
            const leader = counter[0]?.value?.toString();
            const member2 = counter[1]?.value?.toString();
            const member3 = counter[2]?.value?.toString();
            const member4 = counter[3]?.value?.toString();
            
        }   
    }

    public override async autocomplete(interaction: any): Promise<void> {
        await this.heroAutocomplete(interaction);
    }
}




export default Help;