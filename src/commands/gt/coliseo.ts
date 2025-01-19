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
                    description: "Añadir una captura a un equipo usando su ID.",
                    name: "añadir_captura_id",
                    options: [
                        { type: ChoiceType.STRING, name: "id", description: "ID del equipo", required: true },
                        { type: ChoiceType.ATTACHMENT, name: "screenshot", description: "Imagen a subir.", required: true },
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
                    description: "Eliminar una captura de un equipo registrado.",
                    name: "borrar_captura",
                    options: [
                        { type: ChoiceType.STRING, name: "id", description: "ID del equipo", required: true },
                        { type: ChoiceType.STRING, name: "screenshot", description: "ID de la captura", required: true }
                    ]
                },
                /*{
                    type: ChoiceType.SUB_COMMAND,
                    description: "Actualizar IDS",
                    name: "actualizar_ids",
                },*/
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
        const isAdmin = await this.subcommandUtil.hasPermission(interaction);

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
            } else {
                await this.notAdminMessage(interaction);
            }
        } else if (interaction.options.data[0].name === "ver_equipo") {
            await this.subcommandUtil.verEquipoSubcommand(client, interaction, handler, TeamGameMode.COLOSSEUM);
        } else if (interaction.options.data[0].name === "listar") {
            await this.subcommandUtil.listarSubcommand(client, interaction, handler, TeamGameMode.COLOSSEUM);
        } else if(interaction.options.data[0].name === "info") {
            const embed = new Embed()
            .setDescription("Este bot tiene la finalidad de crear una guía ya sean de presets o counters para coliseo en **Guardian Tales**.\n\nSi algun contenido que te haya mostrado el bot no te funciona, no te preocupes, puedes reintentarlo!\n\nEspero que ganes todas sus batallas, " + interaction.user.displayName + ", nos vemos. :wave:")
            .setFooter({ text: interaction.user.username, iconURL: !interaction.user.avatarURL()! ? "https://i.pinimg.com/originals/f1/0f/f7/f10ff70a7155e5ab666bcdd1b45b726d.jpg" : interaction.user.avatarURL()!})
            .setThumbnail("https://r2.e-z.host/a992a427-74c5-45d9-8edb-61722d83e2b4/ch84t1vn.png")
            .setColor(0xe30e4a)
            .setTitle("Información del comando: __/coliseo__")
            await interaction.reply({embeds: [embed], ephemeral: true})
        } else if(interaction.options.data[0].name === "añadir_captura_id") {
            if (isAdmin) {
                await this.subcommandUtil.addScreenshotWithIDSubcommand(client, interaction, handler);
            } else {
                await this.notAdminMessage(interaction);
            }
        } else if(interaction.options.data[0].name === "borrar_captura") {
            if(isAdmin) {
                await this.subcommandUtil.borrarCapturaSubcommand(client, interaction, handler, TeamGameMode.COLOSSEUM);
            } else {
                await this.notAdminMessage(interaction);
            }
        } else if(interaction.options.data[0].name === "actualizar_ids") {
            if(isAdmin) {
                await this.subcommandUtil.actualizarIDs(client, interaction, handler);
            } else {
                await this.notAdminMessage(interaction);
            }
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

    public async notAdminMessage(interaction: CommandInteraction) {
        const embed = new Embed()
        .setDescription(`:x: No tienes permisos para usar este comando.`)
        .setFooter({ text: "Ranpang", iconURL: "https://r2.e-z.host/a992a427-74c5-45d9-8edb-61722d83e2b4/r6taxujw.png" })
        .setColor(0xe30e4a)

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}




export default Help;