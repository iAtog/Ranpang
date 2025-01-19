import {Command, ChoiceType} from "../../class/Command.ts";
import { Client, CommandInteraction } from "npm:discord.js";
import { Embed } from "npm:@notenoughupdates/discord.js-builders";

class Permisos extends Command {
    constructor() {
        super({
            name: "permisos",
            description: "Gestionar permisos del bot (Solo para admins)",
            choices: [
                {
                    type: ChoiceType.SUB_COMMAND,
                    description: "Listar a todas las personas que tienen permisos",
                    name: "listado"
                },
                {
                    type: ChoiceType.SUB_COMMAND,
                    description: "Añadir un usuario a la lista de permisos",
                    name: "añadir",
                    options: [
                        { type: ChoiceType.USER, name: "user", description: "Usuario a añadir", required: true }
                    ]
                },
                {
                    type: ChoiceType.SUB_COMMAND,
                    description: "Eliminar un usuario de la lista de permisos",
                    name: "eliminar",
                    options: [
                        { type: ChoiceType.USER, name: "user", description: "Usuario a eliminar", required: true }
                    ]
                }
            ]
        });
    }

    async run(client: Client, interaction: CommandInteraction) {
        const isAdmin = interaction.user.id === Deno.env.get("ADMIN_ID");
        if (!isAdmin) {
            const embed = new Embed()
            .setDescription(`:x: No tienes permisos para usar este comando.`)
            .setFooter({ text: "Ranpang", iconURL: "https://r2.e-z.host/a992a427-74c5-45d9-8edb-61722d83e2b4/r6taxujw.png" })
            .setColor(0xe30e4a)

            await interaction.reply({ embeds: [embed] });
            return;
        }

        if(interaction.options.data[0].name === "listado") {
            const permisos = this.getJsonSync("./local/permisos.json") as string[];
            const usernames = [];

            for await (const permiso of permisos) {
                const user = await interaction.client.users.fetch(permiso);
                usernames.push("**" + user.username + "** (" + user.id + ")");
            }

            const embed = new Embed()
            .setDescription(`:white_check_mark: Listado de permisos:\n\n* ${usernames.join("\n* ")}`)
            .setFooter({ text: "Ranpang", iconURL: "https://r2.e-z.host/a992a427-74c5-45d9-8edb-61722d83e2b4/r6taxujw.png" })
            .setTimestamp(Date.now())
            .setColor(0xe30e4a)

            await interaction.reply({ embeds: [embed] });
        } else if(interaction.options.data[0].name === "añadir") {
            const permisos = this.getJsonSync("./local/permisos.json") as string[];
            const user = interaction.options.get("user")?.user;

            if(user) {
                permisos.push(user.id);
                this.writeJson("./local/permisos.json", permisos)

                const embed = new Embed()
                .setDescription(`:white_check_mark: Se ha añadido al permiso de \`${user.username}\`.`)
                .setFooter({ text: "Ranpang", iconURL: "https://r2.e-z.host/a992a427-74c5-45d9-8edb-61722d83e2b4/r6taxujw.png" })
                .setTimestamp(Date.now())
                .setColor(0xe30e4a)

                await interaction.reply({ embeds: [embed] });
            }
        } else if(interaction.options.data[0].name === "eliminar") {
            const permisos = this.getJsonSync("./local/permisos.json") as string[];
            const user = interaction.options.get("user")?.user;

            if(user) {
                const index = permisos.indexOf(user.id);
                if(index !== -1) {
                    permisos.splice(index, 1);
                    this.writeJson("./local/permisos.json", permisos)

                    const embed = new Embed()
                    .setDescription(`:white_check_mark: Se le han eliminado los derechos a \`${user.username}\`.`)
                    .setFooter({ text: "Ranpang", iconURL: "https://r2.e-z.host/a992a427-74c5-45d9-8edb-61722d83e2b4/r6taxujw.png" })
                    .setTimestamp(Date.now())
                    .setColor(0xe30e4a)

                    await interaction.reply({ embeds: [embed] });
                } else {
                    const embed = new Embed()
                    .setDescription(`:x: No se encontró el usuario.`)
                    .setFooter({ text: "Ranpang", iconURL: "https://r2.e-z.host/a992a427-74c5-45d9-8edb-61722d83e2b4/r6taxujw.png" })
                    .setTimestamp(Date.now())
                    .setColor(0xe30e4a)

                    await interaction.reply({ embeds: [embed] });
                }
            }
        }
        
    }
    
    private getJsonSync(filePath: string) {
        return JSON.parse(Deno.readTextFileSync(filePath));
    }

    private async writeJson(filePath:string, o:any) {
        await Deno.writeTextFile(filePath, JSON.stringify(o));
    }
}

export default Permisos;