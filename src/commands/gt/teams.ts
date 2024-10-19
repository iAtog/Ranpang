
import { Command, ChoiceType } from "../../class/Command.ts";
import { Client, CommandInteraction, AutocompleteInteraction } from "npm:discord.js";
import { TeamGameMode, TeamsHandler, TeamType, type Screenshot } from "../../lib/team/mod.ts";
import EZ_Host from "../../lib/e-z_host/mod.ts";
import { Database } from "../../lib/db/mod.ts";
import { SubcommandUtil } from "../../lib/subcommand/mod.ts";

class Help extends Command {
    private subcommandUtil: SubcommandUtil;

    constructor() {
        super({
            name: "coliseo",
            description: "Builds y counters (no asegurados)",
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
                        { type: ChoiceType.STRING, name: "leader" , description: "Lider del grupo", required: true, autocomplete: true },
                        { type: ChoiceType.STRING, name: "member2", description: "Segundo miembro", required: true, autocomplete: true },
                        { type: ChoiceType.STRING, name: "member3", description: "Tercer miembro",  required: true, autocomplete: true },
                        { type: ChoiceType.STRING, name: "member4", description: "Cuarto miembro",  required: true, autocomplete: true }
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
                        { type: ChoiceType.STRING, name: "member3", description: "Tercer miembro",  required: true, autocomplete: true },
                        { type: ChoiceType.STRING, name: "member4", description: "Cuarto miembro",  required: true, autocomplete: true },
                        { type: ChoiceType.ATTACHMENT, name: "screenshot", description: "Imagen de registro de batalla con victoria" },
                        { type: ChoiceType.STRING, name: "author", description: "Nombre del autor de la imagen" }
                    ]
                },
                {
                    type: ChoiceType.SUB_COMMAND,
                    description: "Eliminar un equipo de la base de datos. (Solo personal autorizado)",
                    name: "eliminar_team",
                    options: [
                        { type: ChoiceType.STRING, name: "id", description: "ID del equipo", required: true }
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
                        { type: ChoiceType.STRING, name: "member3", description: "Tercer miembro",  required: true, autocomplete: true },
                        { type: ChoiceType.STRING, name: "member4", description: "Cuarto miembro",  required: true, autocomplete: true },
                        { type: ChoiceType.ATTACHMENT, name: "screenshot", description: "Imagen de registro de batalla con victoria", required: true },
                        { type: ChoiceType.STRING, name: "author", description: "Nombre del autor de la imagen" }
                    ]
                },
                {
                    type: ChoiceType.SUB_COMMAND,
                    description: "Ver un equipo con su ID.",
                    name: "ver_equipo",
                    options: [
                        { type: ChoiceType.STRING, name: "id", description: "ID del equipo", required: true }
                    ]
                },
                {
                    type: ChoiceType.SUB_COMMAND,
                    description: "Ver una lista de los equipos registrados.",
                    name: "listar" // LISTAR POR FIELDS
                }
            ]
        });

        this.subcommandUtil = new SubcommandUtil();
    }

    async run(client: Client, interaction: CommandInteraction) {
        if (!client.teams) {
            await interaction.reply({ content: ":x: Ocurrió un error en la carga de datos, por favor intenta nuevamente", ephemeral: true });
            return;
        }

        const handler = client.teams as TeamsHandler;
        const data = interaction.options.data;
        const gamemode = TeamGameMode.COLOSSEUM;
        const isAdmin = interaction.user.id === Deno.env.get("ADMIN_ID");

        if(!data[0]) return;

        if (interaction.options.data[0].name === "counters") {
            await this.subcommandUtil.runTeam(client, interaction, handler, TeamType.COUNTERS, gamemode);
        } else if(interaction.options.data[0].name === "presets") {
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
        else if(interaction.options.data[0].name === "eliminar_team") {
            if(isAdmin) {
                await this.subcommandUtil.deleteTeamSubcommand(client, interaction, handler, TeamGameMode.COLOSSEUM)
            }
        } else if(interaction.options.data[0].name === "eliminar_captura") {
            await interaction.reply({ content: ":x: No se ha implementado la opción de eliminar capturas" });
        } else if(interaction.options.data[0].name === "ver_equipo") {
            await this.subcommandUtil.verEquipoSubcommand(client, interaction, handler, TeamGameMode.COLOSSEUM);
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