import { Command, ChoiceType } from "../../class/Command.ts";
import { Client, CommandInteraction, AutocompleteInteraction } from "npm:discord.js";
import { TeamGameMode, TeamsHandler, TeamType } from "../../lib/team/mod.ts";
import { Embed } from "npm:@notenoughupdates/discord.js-builders";

class Help extends Command {
    constructor() {
        super({
            name: "coliseo",
            description: "Ver counters y builds para ganarle a un equipo.",
            choices: [
                {
                    type: ChoiceType.SUB_COMMAND,
                    description: "Lista de equipos que podrían vencer al especificado.",
                    name: "counters",
                    options: [
                        { type: ChoiceType.STRING, name: "leader", description: "Lider del grupo", required: true, autocomplete: true },
                        { type: ChoiceType.STRING, name: "member2", description: "Primer miembro", required: true, autocomplete: true },
                        { type: ChoiceType.STRING, name: "member3", description: "Tercer miembro", required: true, autocomplete: true },
                        { type: ChoiceType.STRING, name: "member4", description: "Cuarto miembro", required: true, autocomplete: true }
                    ]
                },
                {
                    type: ChoiceType.SUB_COMMAND,
                    description: "Ver como está equipado cierto equipo.",
                    name: "presets",
                    options: [
                        { type: ChoiceType.STRING, name: "leader", description: "Lider del grupo", required: true, autocomplete: true },
                        { type: ChoiceType.STRING, name: "member2", description: "Segundo miembro", required: true, autocomplete: true },
                        { type: ChoiceType.STRING, name: "member3", description: "Tercer miembro", required: true, autocomplete: true },
                        { type: ChoiceType.STRING, name: "member4", description: "Cuarto miembro", required: true, autocomplete: true }
                    ]
                },
                {
                    type: ChoiceType.SUB_COMMAND,
                    description: "Añadir un equipo de la base de datos. (Solo personal autorizado)",
                    name: "crear_equipo",
                    options: [
                        { type: ChoiceType.STRING, name: "type", description: "Tipo del equipo (counters o presets)", required: true, autocomplete: true },
                        { type: ChoiceType.STRING, name: "description", description: "Descripción del equipo (puede ser una nota)", required: true },
                        { type: ChoiceType.STRING, name: "leader", description: "Lider del grupo", required: true, autocomplete: true },
                        { type: ChoiceType.STRING, name: "member2", description: "Segundo miembro", required: true, autocomplete: true },
                        { type: ChoiceType.STRING, name: "member3", description: "Tercer miembro", required: true, autocomplete: true },
                        { type: ChoiceType.STRING, name: "member4", description: "Cuarto miembro", required: true, autocomplete: true },
                        { type: ChoiceType.ATTACHMENT, name: "screenshot", description: "Imagen de registro de batalla con victoria" },
                        { type: ChoiceType.STRING, name: "author", description: "Nombre del autor de la imagen" }
                    ]
                },
                {
                    type: ChoiceType.SUB_COMMAND,
                    description: "Eliminar un equipo de la base de datos. (Solo personal autorizado)",
                    name: "eliminar_team",
                    options: [{ type: ChoiceType.STRING, name: "id", description: "ID del equipo", required: true }]
                },
                {
                    type: ChoiceType.SUB_COMMAND,
                    description: "Añadir una captura a un equipo (ya sea presets o counters)",
                    name: "añadir_captura",
                    options: [
                        { type: ChoiceType.STRING, name: "type", description: "Tipo del equipo (counters o presets)", required: true, autocomplete: true },
                        { type: ChoiceType.STRING, name: "leader", description: "Lider del grupo", required: true, autocomplete: true },
                        { type: ChoiceType.STRING, name: "member2", description: "Segundo miembro", required: true, autocomplete: true },
                        { type: ChoiceType.STRING, name: "member3", description: "Tercer miembro", required: true, autocomplete: true },
                        { type: ChoiceType.STRING, name: "member4", description: "Cuarto miembro", required: true, autocomplete: true },
                        { type: ChoiceType.ATTACHMENT, name: "screenshot", description: "Imagen de registro de batalla con victoria", required: true },
                        { type: ChoiceType.STRING, name: "author", description: "Nombre del autor de la imagen" }
                    ]
                },
                {
                    type: ChoiceType.SUB_COMMAND,
                    description: "Ver un equipo con su ID.",
                    name: "ver_equipo",
                    options: [{ type: ChoiceType.STRING, name: "id", description: "ID del equipo", required: true }]
                },
                {
                    type: ChoiceType.SUB_COMMAND,
                    description: "Ver una lista de los equipos registrados.",
                    name: "listar", // LISTAR POR FIELDS
                    /*options: [
                        { type: ChoiceType.STRING, name: "type", description: "Tipo del equipo (counters o presets)", autocomplete: true }
                    ]*/
                },
                {
                    type: ChoiceType.SUB_COMMAND,
                    description: "Información sobre el comando.",
                    name: "info"
                }
            ]
        });
    }

    async run(client: Client, interaction: CommandInteraction) {
        if (!client.teams!) {
            await interaction.reply({ content: ":x: Ocurrió un error en la carga de datos, por favor intenta nuevamente", ephemeral: true });
            return;
        }

        const handler = (client.teams) as TeamsHandler;
        const data = interaction.options.data;
        const gamemode = TeamGameMode.COLOSSEUM;
        const isAdmin = interaction.user.id === Deno.env.get("ADMIN_ID");

        if (!data[0]) return;

        if (interaction.options.data[0].name === "counters") {
            await this.subcommandUtil.runTeam(client, interaction, handler, TeamType.COUNTERS, gamemode);
        } else if (interaction.options.data[0].name === "presets") {
            await this.subcommandUtil.runTeam(client, interaction, handler, TeamType.PRESET, gamemode);
        }
        else if (interaction.options.data[0].name === "crear_equipo") {
            if (isAdmin) {
                await this.subcommandUtil.crearSubcommand(client, interaction, handler, gamemode)
            } else {
                await interaction.reply({ content: ":x: No tienes permisos para crear equipos", ephemeral: true });
            }
        } else if (interaction.options.data[0].name === "añadir_captura") {
            if (isAdmin) {
                await this.subcommandUtil.addScreenshotSubcommand(client, interaction, handler, gamemode);
            } else {
                await interaction.reply({ content: ":x: No tienes permisos para añadir capturas", ephemeral: true });
            }
        }
        else if (interaction.options.data[0].name === "eliminar_team") {
            if (isAdmin) {
                await this.subcommandUtil.deleteTeamSubcommand(client, interaction, handler, TeamGameMode.COLOSSEUM)
            }
        } else if (interaction.options.data[0].name === "eliminar_captura") {
            await interaction.reply({ content: ":x: No se ha implementado la opción de eliminar capturas" });
        } else if (interaction.options.data[0].name === "ver_equipo") {
            await this.subcommandUtil.verEquipoSubcommand(client, interaction, handler, TeamGameMode.COLOSSEUM);
        } else if (interaction.options.data[0].name === "listar") {
            await this.subcommandUtil.listarSubcommand(client, interaction, handler, TeamGameMode.COLOSSEUM);
        } else if(interaction.options.data[0].name === "info") {
            const embed = new Embed()
            .setDescription("Este comando tiene la finalidad de crear equipos para el modo de juego **Coliseo** de **Guardian Tales**.\n\nLa IA al ser impredecible a veces puedes llegar a perder con un equipo con el que supuestamente ibas a ganar, pero todo depende de la suerte!\n\nEl objetivo es mostrar posisiconamiento porque siempre varían, así puedes formar el tuyo a base de el posicionamiento que alguien ganó teniendo en cuenta las imágenes.\n\nEspero que gane todas sus batallas " + interaction.user.displayName + ", nos vemos. :wave:")
            .setFooter({ text: interaction.user.username, iconURL: !interaction.user.avatarURL()! ? "https://i.pinimg.com/originals/f1/0f/f7/f10ff70a7155e5ab666bcdd1b45b726d.jpg" : interaction.user.avatarURL()!})
            .setThumbnail("https://r2.e-z.host/a992a427-74c5-45d9-8edb-61722d83e2b4/ch84t1vn.png")
            .setColor(0xe30e4a)
            .setTitle("Información del comando: __/coliseo__")
            await interaction.reply({embeds: [embed]})
        }
    }

    public override async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        if (interaction.options.getFocused(true).name === "gamemode") {
            await this.gamemodeAutocomplete(interaction);
            return;
        }
        if (interaction.options.getFocused(true).name === "type") {
            await this.typeAutocomplete(interaction);
            return;
        }
        await this.heroAutocomplete(interaction, interaction.client.teams.TwoStarHeros());
    }
}




export default Help;