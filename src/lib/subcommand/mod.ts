import { Command, ChoiceType } from "../../class/Command.ts";
import { Client, CommandInteraction, AutocompleteInteraction } from "npm:discord.js";
import { Embed } from "npm:@notenoughupdates/discord.js-builders";
import { TeamGameMode, TeamsHandler, TeamType, type Screenshot } from "../../lib/team/mod.ts";
import EZ_Host from "../../lib/e-z_host/mod.ts";
import { Database } from "../../lib/db/mod.ts";

class SubcommandUtil {
    public async runTeam(client: Client, interaction: CommandInteraction, handler: TeamsHandler, type: TeamType, gamemode: TeamGameMode) {
        const options = interaction.options.data[0].options;
        if (!options) {
            await interaction.reply({ content: "Error: No se encontró el grupo." });
            return;
        };
        await interaction.reply({ content: "<a:loading:1296272884955877427> Consultando la base de datos..." })
        const leader = interaction.options.get("leader")?.value?.toString();
        const member2 = interaction.options.get("member2")?.value?.toString();
        const member3 = interaction.options.get("member3")?.value?.toString();
        const member4 = interaction.options.get("member4")?.value?.toString();

        const teamMembers = await handler.generateTeamMembers([leader!, member2!, member3!, member4!]);
        interaction.editReply({ content: "<a:loading:1296272884955877427> Creando instancia de equipo..." })
        const team = await handler.getTeamByMembers(type, teamMembers, gamemode);

        if (!team) {
            interaction.editReply({ content: ":x: Error: No se encontró el equipo." })
            return;
        }

        //const embed = handler.createTeamEmbed(team);
        //const rows = handler.getScrollButtons() as any;

        await interaction.deleteReply();

        const channel = client.channels.cache.get(interaction.channelId) as any;
        const paginatedEmbed = await handler.createTeamEmbedPaginated(team);

        await paginatedEmbed.send({
            message: `<@${interaction.user.id}>`,
            options: {
                channel
            }
        })
    }

    public async crearSubcommand(client: Client, interaction: CommandInteraction, teamsHandler: TeamsHandler, gamemode: TeamGameMode): Promise<void> {
        const ezApi = client.ez_api as EZ_Host;

        const description = interaction.options.get("description")?.value?.toString();
        const leader = interaction.options.get("leader")?.value?.toString();
        const member2 = interaction.options.get("member2")?.value?.toString();
        const member3 = interaction.options.get("member3")?.value?.toString();
        const member4 = interaction.options.get("member4")?.value?.toString();
        const type = interaction.options.get("type")?.value?.toString();
        const screenshot = interaction.options.get("screenshot")?.attachment?.url;
        const screenshots: Screenshot[] = [];
        const author = interaction.options.get("author")?.value?.toString();

        await interaction.reply({ content: "<a:loading:1296272884955877427> Iniciando creación de equipo..." });

        let realType: TeamType;
        if (type === "COUNTERS") {
            realType = TeamType.COUNTERS;
        } else if (type === "PRESET") {
            realType = TeamType.PRESET;
        } else {
            await interaction.editReply({ content: "Error: Tipo de equipo no reconocido" });
            return;
        }

        if (!gamemode || !description || !leader || !member2 || !member3 || !member4 || !type) {
            await interaction.editReply({ content: "Error: Faltan parámetros" });
            return;
        }

        await interaction.editReply({ content: "<a:loading:1296272884955877427> Registrando el equipo..." });
        const members = await teamsHandler.generateTeamMembers([leader, member2, member3, member4]);
        const dbTeams = await teamsHandler.getTeamByMembers(realType, members, gamemode)

        if (dbTeams !== undefined) {
            await interaction.editReply({ content: "Error: Ya existe un equipo con esos miembros, tipo y modo. (ID: `" + dbTeams.id + "`)" });
            return;
        }

        const newTeam = await teamsHandler.createTeamObject(realType, gamemode, description, members, screenshots);

        if (screenshot) {
            await interaction.editReply({ content: "<a:loading:1296272884955877427> Subiendo imagen al host..." });
            const hostedUrl = await ezApi.createUrl(screenshot);
            if (hostedUrl) {
                const auth = !author ? interaction.user.username : author;
                screenshots.push({
                    author: auth,
                    url: hostedUrl
                });
            } else {
                await interaction.editReply({ content: "Error: No se pudo hostear la imagen. :warning:" });
                return;
            }
        }

        const success = await teamsHandler.addTeam(newTeam);
        if (success) {
            const embed = await teamsHandler.createTeamEmbed(newTeam);
            await interaction.editReply({ content: "✅ Equipo registrado con éxito. ID: `" + newTeam.id + "`", embeds: [embed] });
        } else {
            await interaction.editReply({ content: ":x: Error: No se pudo registrar el equipo" });
        }
    }

    public async addScreenshotSubcommand(client: Client, interaction: CommandInteraction, handler: TeamsHandler, gamemode: TeamGameMode) {
        const counter = interaction.options.data[0].options;
        const ezApi = client.ez_api as EZ_Host;

        if (!counter) {
            await interaction.reply({ content: "Error: No se encontró el grupo" });
            return;
        };
        await interaction.reply({ content: "<a:loading:1296272884955877427> Consultando la base de datos..." })
        const leader = interaction.options.get("leader")?.value?.toString();
        const member2 = interaction.options.get("member2")?.value?.toString();
        const member3 = interaction.options.get("member3")?.value?.toString();
        const member4 = interaction.options.get("member4")?.value?.toString();
        const author = interaction.options.get("author")?.value?.toString();
        const type = interaction.options.get("type")?.value?.toString();
        const screenshot = interaction.options.get("screenshot")?.attachment?.url;

        let realType: TeamType;
        if (type?.toLowerCase() === "counters") {
            realType = TeamType.COUNTERS;
        } else if (type?.toLowerCase() === "preset") {
            realType = TeamType.PRESET;
        } else {
            interaction.editReply({ content: "Error: Tipo de equipo no reconocido" });
            return;
        }

        const teamMembers = await handler.generateTeamMembers([leader!, member2!, member3!, member4!]);
        await interaction.editReply({ content: "<a:loading:1296272884955877427> Creando instancia de equipo..." })
        const team = await handler.getTeamByMembers(realType, teamMembers, gamemode);

        if (!team || team === undefined || team === null) {
            await interaction.editReply({ content: ":x: No se encontró el equipo." })
            return;
        }

        await interaction.editReply({ content: "<a:loading:1296272884955877427> ¡Equipo #`" + team.id + "` encontrado!" })
        const database = interaction.client.database as Database;
        const screenshots: Screenshot[] = [...team.screenshots];
        if (screenshot) {
            await interaction.editReply({ content: "<a:loading:1296272884955877427> Subiendo imagen al host..." });
            const hostedUrl = await ezApi.createUrl(screenshot);
            if (hostedUrl && hostedUrl !== "") {
                const auth = !author ? interaction.user.username : author;
                screenshots.push({
                    author: auth,
                    url: hostedUrl
                });
            } else {
                await interaction.editReply({ content: ":x: No se pudo subir la imagen al hosting." });
                return;
            }
        }

        team.screenshots = screenshots;
        const response = await database.update(team.id, team);

        if (response) {
            await interaction.editReply({ content: "✅ Se ha añadido una captura al equipo #`" + team.id + "`." });
        } else {
            await interaction.editReply({ content: ":x: No se ha podido añadir la captura al equipo." });
        }
    }

    public async addScreenshotWithIDSubcommand(client: Client, interaction: CommandInteraction, handler: TeamsHandler) {
        const counter = interaction.options.data[0].options;
        const ezApi = client.ez_api as EZ_Host;

        if (!counter) {
            await interaction.reply({ content: "Error: No se encontró el grupo" });
            return;
        };

        await interaction.reply({ content: "<a:loading:1296272884955877427> Consultando la base de datos..." })
        const id = interaction.options.get("id")?.value?.toString();
        const author = interaction.options.get("author")?.value?.toString();
        const screenshot = interaction.options.get("screenshot")?.attachment?.url;

        await interaction.editReply({ content: "<a:loading:1296272884955877427> Creando instancia de equipo..." })
        const team = await handler.getTeam(id!);

        if (!team || team === undefined || team === null) {
            await interaction.editReply({ content: ":x: No se encontró el equipo." })
            return;
        }

        await interaction.editReply({ content: "<a:loading:1296272884955877427> ¡Equipo #`" + team.id + "` encontrado!" })
        const database = interaction.client.database as Database;
        const screenshots: Screenshot[] = [...team.screenshots];
        if (screenshot) {
            await interaction.editReply({ content: "<a:loading:1296272884955877427> Subiendo imagen al host..." });
            const hostedUrl = await ezApi.createUrl(screenshot);
            if (hostedUrl && hostedUrl !== "") {
                const auth = !author ? interaction.user.username : author;
                screenshots.push({
                    author: auth,
                    url: hostedUrl
                });
            } else {
                await interaction.editReply({ content: ":x: No se pudo subir la imagen al hosting." });
                return;
            }
        }

        team.screenshots = screenshots;
        const response = await database.update(team.id, team);

        if (response) {
            await interaction.editReply({ content: "✅ Se ha añadido una captura al equipo #`" + team.id + "`." });
        } else {
            await interaction.editReply({ content: ":x: No se ha podido añadir la captura al equipo." });
        }
    }

    public async deleteTeamSubcommand(client: Client, interaction: CommandInteraction, handler: TeamsHandler, gamemode: TeamGameMode) {
        const counter = interaction.options.data[0].options;
        if (!counter) {
            await interaction.reply({ content: "Error: No se encontró el grupo" });
            return;
        };
        await interaction.reply({ content: "<a:loading:1296272884955877427> Consultando la base de datos..." })
        const id = interaction.options.get("id")?.value?.toString();

        await interaction.editReply({ content: "<a:loading:1296272884955877427> Creando instancia de equipo..." })
        const team = await handler.getTeam(id!);

        if (!team || team === undefined || team === null) {
            await interaction.editReply({ content: ":x: Error: No se encontró el equipo." })
            return;
        }

        await interaction.editReply({ content: "<a:loading:1296272884955877427> ¡Equipo #`" + team.id + "` encontrado!" })
        const database = interaction.client.database as Database;

        await database.remove(team.id);
        await interaction.editReply({ content: "✅ Se ha eliminado el equipo #`" + team.id + "`." });
    }

    public async verEquipoSubcommand(client: Client, interaction: CommandInteraction, handler: TeamsHandler, gamemode: TeamGameMode) {
        const counter = interaction.options.data[0].options;
        if (!counter) {
            await interaction.reply({ content: "Error: No se encontró el grupo" });
            return;
        };
        await interaction.reply({ content: "<a:loading:1296272884955877427> Consultando la base de datos..." })
        const id = interaction.options.get("id")?.value?.toString();

        await interaction.editReply({ content: "<a:loading:1296272884955877427> Creando instancia de equipo..." })
        const team = await handler.getTeam(id!);

        if (!team || team === undefined || team === null) {
            await interaction.editReply({ content: ":x: Error: No se encontró el equipo." })
            return;
        }

        await interaction.deleteReply();

        const channel = client.channels.cache.get(interaction.channelId) as any;
        const paginatedEmbed = await handler.createTeamEmbedPaginated(team);

        await paginatedEmbed.send({
            message: `<@${interaction.user.id}> has consultado el equipo #\`${team.id}\``,
            options: {
                channel
            }
        })
    }

    public async listarSubcommand(client: Client, interaction: CommandInteraction, handler: TeamsHandler, gamemode: TeamGameMode) {
        await interaction.reply({ content: "<a:loading:1296272884955877427> Consultando la base de datos..." })

        const teams = await handler.getTeamsByGamemode(gamemode);

        await interaction.editReply({ content: "<a:loading:1296272884955877427> Listando equipos..." })

        if(teams.length === 0) {
            await interaction.editReply({ content: ":x: No se encontraron equipos." });
            return;
        }

        await interaction.deleteReply();

        const channel = client.channels.cache.get(interaction.channelId) as any;
        const paginatedEmbed = await handler.createTeamsEmbedPaginated(teams, gamemode);

        await paginatedEmbed.send({
            message: `<@${interaction.user.id}>`,
            options: {
                channel
            }
        })
    }
}

export {
    SubcommandUtil
}