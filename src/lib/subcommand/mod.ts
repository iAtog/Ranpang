//import { Command, ChoiceType } from "../../class/Command.ts";
import { Client, CommandInteraction, AutocompleteInteraction, Interaction } from "npm:discord.js";
import { TeamGameMode, TeamsHandler, Team, TeamType, type Screenshot } from "../../lib/team/mod.ts";
import EZ_Host from "../../lib/e-z_host/mod.ts";
import { Database } from "../../lib/db/mod.ts";
class SubcommandUtil {

    public async hasPermission(interaction: CommandInteraction) {
        const isAdmin = interaction.user.id === Deno.env.get("ADMIN_ID");
        const file = JSON.parse(await Deno.readTextFileSync("./local/permisos.json"));

        if(file.includes(interaction.user.id) || isAdmin) {
            return true;
        } else {
            return false;
        }
    }

    public async actualizarIDs(client: Client, interaction: CommandInteraction, handler: TeamsHandler) {
        const teams = await handler.getTeams();

        for await (const team of teams) {
            const database = client.database as Database;
            const screenshots: Screenshot[] = [];

            for await (const screenshot of team.screenshots) {
                screenshots.push({
                    id: (screenshot.id == undefined || !screenshot.id) ? this.generateRandomId() : screenshot.id,
                    author: screenshot.author,
                    url: screenshot.url
                });
            }

            team.screenshots = screenshots;
            
            await database.update(team.id, team);
        }

        await interaction.reply({ content: "✅ IDs actualizados.", ephemeral: true });
    }

    public async runTeam(client: Client, interaction: CommandInteraction, handler: TeamsHandler, type: TeamType, gamemode: TeamGameMode) {
        const options = interaction.options.data[0].options;

        if (!options) {
            await interaction.reply({ content: ":x: Error: No se encontró el grupo.", ephemeral: true });
            return;
        }

        await interaction.deferReply({ephemeral: true});

        const leader = interaction.options.get("leader")?.value?.toString();
        const member2 = interaction.options.get("member2")?.value?.toString();
        const member3 = interaction.options.get("member3")?.value?.toString();
        const member4 = interaction.options.get("member4")?.value?.toString();

        const teamMembers = await handler.generateTeamMembers([leader!, member2!, member3!, member4!]);
        
        const team = await handler.getTeamByMembers(type, teamMembers, gamemode);

        if (!team) {
            interaction.followUp({ content: ":x: Error: No se encontró el equipo.", ephemeral: true })
            return;
        }

        const channel = client.channels.cache.get(interaction.channelId) as any;
        const paginatedEmbed = await handler.createTeamEmbedPaginated(team);

        await paginatedEmbed.send({
            message: `<@${interaction.user.id}>`,
            options: {
                channel,
                ephemeral: true,
                interaction: interaction as Interaction,
                followUp: true
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
        const author = interaction.options.get("author")?.value?.toString().trim();

        await interaction.deferReply({ephemeral: true})

        let realType: TeamType;
        if (type === "COUNTERS") {
            realType = TeamType.COUNTERS;
        } else if (type === "PRESET") {
            realType = TeamType.PRESET;
        } else {
            await interaction.followUp({ content: "Error: Tipo de equipo no reconocido", ephemeral: true });
            return;
        }

        if (!gamemode || !description || !leader || !member2 || !member3 || !member4 || !type) {
            await interaction.followUp({ content: "Error: Faltan parámetros", ephemeral: true });
            return;
        }

        await interaction.followUp({ content: "<a:loading:1296272884955877427> Registrando el equipo...", ephemeral: true });
        const members = await teamsHandler.generateTeamMembers([leader, member2, member3, member4]);
        const dbTeams = await teamsHandler.getTeamByMembers(realType, members, gamemode)

        if (dbTeams !== undefined) {
            await interaction.followUp({ content: "Error: Ya existe un equipo con esos miembros, tipo y modo de juego. (ID: `" + dbTeams.id + "`)", ephemeral: true });
            return;
        }

        const newTeam: Team = await teamsHandler.createTeamObject(realType, gamemode, description, members, screenshots);

        if (screenshot) {
            await interaction.followUp({ content: "<a:loading:1296272884955877427> Subiendo imagen al host...", ephemeral: true });
            const hostedUrl = await ezApi.createUrl(screenshot);
            if (hostedUrl) {
                const auth = (!author || author.trim() === "") ? interaction.user.username : author;
                screenshots.push({
                    author: auth,
                    url: hostedUrl,
                    id: this.generateRandomId()
                });
            } else {
                await interaction.followUp({ content: "Error: No se pudo hostear la imagen. :warning:", ephemeral: true });
                return;
            }
        }

        const success = await teamsHandler.addTeam(newTeam);
        if (success) {
            const embed = await teamsHandler.createTeamEmbed(newTeam);
            await interaction.followUp({ 
                content: "✅ Equipo registrado con éxito. ID: `#" + newTeam.id + "`", 
                embeds: [embed],
                ephemeral: true
            });
        } else {
            await interaction.followUp({ content: ":x: Error: No se pudo registrar el equipo", ephemeral: true });
        }
    }

    public async addScreenshotSubcommand(client: Client, interaction: CommandInteraction, handler: TeamsHandler, gamemode: TeamGameMode) {
        const counter = interaction.options.data[0].options;
        const ezApi = client.ez_api as EZ_Host;

        if (!counter) {
            await interaction.reply({ content: "Error: No se encontró el grupo", ephemeral: true });
            return;
        };

        await interaction.deferReply({ephemeral: true});

        const leader = interaction.options.get("leader")?.value?.toString();
        const member2 = interaction.options.get("member2")?.value?.toString();
        const member3 = interaction.options.get("member3")?.value?.toString();
        const member4 = interaction.options.get("member4")?.value?.toString();
        const author = interaction.options.get("author")?.value?.toString().trim();
        const type = interaction.options.get("type")?.value?.toString();
        const screenshot = interaction.options.get("screenshot")?.attachment?.url;

        let realType: TeamType;
        if (type?.toLowerCase() === "counters") {
            realType = TeamType.COUNTERS;
        } else if (type?.toLowerCase() === "preset") {
            realType = TeamType.PRESET;
        } else {
            interaction.followUp({ content: "Error: Tipo de equipo no reconocido", ephemeral: true });
            return;
        }

        const teamMembers = await handler.generateTeamMembers([leader!, member2!, member3!, member4!]);
        const team = await handler.getTeamByMembers(realType, teamMembers, gamemode);

        if (!team || team === undefined || team === null) {
            await interaction.followUp({ content: ":x: No se encontró el equipo.", ephemeral: true })
            return;
        }

        const database = interaction.client.database as Database;
        const screenshots: Screenshot[] = [...team.screenshots];

        if (screenshot) {
            await interaction.followUp({ content: "<a:loading:1296272884955877427> Subiendo imagen al host...", ephemeral: true });
            const hostedUrl = await ezApi.createUrl(screenshot);
            if (hostedUrl && hostedUrl !== "") {
                const auth = !author ? interaction.user.username : author;
                screenshots.push({
                    author: auth,
                    url: hostedUrl,
                    id: this.generateRandomId()
                });
            } else {
                await interaction.followUp({ content: ":x: No se pudo subir la imagen al hosting.", ephemeral: true });
                return;
            }
        }

        team.screenshots = screenshots;
        const response = await database.update(team.id, team);

        if (response) {
            await interaction.followUp({ content: "✅ Se ha añadido una captura al equipo `#" + team.id + "`.", ephemeral: true });
        } else {
            await interaction.followUp({ content: ":x: No se ha podido añadir la captura al equipo.", ephemeral: true });
        }
    }

    public async addScreenshotWithIDSubcommand(client: Client, interaction: CommandInteraction, handler: TeamsHandler) {
        const counter = interaction.options.data[0].options;
        const ezApi = client.ez_api as EZ_Host;

        if (!counter) {
            await interaction.reply({ content: "Error: No se encontró el grupo", ephemeral: true });
            return;
        };
        await interaction.deferReply({ephemeral: true});

        let id = interaction.options.get("id")?.value?.toString().trim();

        if(id?.startsWith("#")) {
            id = id.substring(1);
        }

        const author = interaction.options.get("author")?.value?.toString().trim();
        const screenshot = interaction.options.get("screenshot")?.attachment?.url;
        const team = await handler.getTeam(id!);

        if (!team || team === undefined || team === null) {
            await interaction.followUp({ content: ":x: No se encontró el equipo.", ephemeral: true })
            return;
        }

        const database = interaction.client.database as Database;
        const screenshots: Screenshot[] = [...team.screenshots];
        if (screenshot) {
            const hostedUrl = await ezApi.createUrl(screenshot);
            if (hostedUrl && hostedUrl !== "") {
                const auth = !author ? interaction.user.username : author;
                screenshots.push({
                    author: auth,
                    url: hostedUrl,
                    id: this.generateRandomId()
                });
            } else {
                await interaction.followUp({ content: ":x: No se pudo subir la imagen al hosting. Intentalo de nuevo.", ephemeral: true });
                return;
            }
        }

        team.screenshots = screenshots;
        const response = await database.update(team.id, team);

        if (response) {
            await interaction.followUp({ content: "✅ Se ha añadido una captura al equipo `#" + team.id + "`.", ephemeral: true });
        } else {
            await interaction.followUp({ content: ":x: No se ha podido añadir la captura al equipo.", ephemeral: true });
        }
    }

    public async deleteTeamSubcommand(client: Client, interaction: CommandInteraction, handler: TeamsHandler, gamemode: TeamGameMode) {
        const counter = interaction.options.data[0].options;
        if (!counter) {
            await interaction.reply({ content: "Error: No se encontró el grupo", ephemeral: true });
            return;
        };

        await interaction.deferReply({ephemeral: true});

        let id = interaction.options.get("id")?.value?.toString().trim();

        if(id?.startsWith("#")) {
            id = id.substring(1);
        }

        const team = await handler.getTeam(id!);

        if (!team || team === undefined || team === null) {
            await interaction.followUp({ content: ":x: Error: No se encontró el equipo.", ephemeral: true });
            return;
        }

        if(team.gamemode.toString().toUpperCase() !== gamemode.toString().toUpperCase()) {
            await interaction.followUp({ content: ":x: Error: El equipo no es de coliseo.", ephemeral: true });
            return;
        }

        const database = interaction.client.database as Database;
        await database.remove(team.id);

        await interaction.followUp({ content: "✅ Se ha eliminado el equipo `#" + team.id + "`.", ephemeral: true });
    }

    public async verEquipoSubcommand(client: Client, interaction: CommandInteraction, handler: TeamsHandler, gamemode: TeamGameMode) {
        const counter = interaction.options.data[0].options;
        if (!counter) {
            await interaction.reply({ content: "Error: No se encontró el grupo", ephemeral: true });
            return;
        };

        await interaction.deferReply({ephemeral: true});

        let id = interaction.options.get("id")?.value?.toString();

        if(id?.startsWith("#")) {
            id = id.substring(1);
        }

        const team = await handler.getTeam(id!);

        if (!team || team === undefined || team === null) {
            await interaction.followUp({ content: ":x: Error: No se encontró el equipo.", ephemeral: true })
            return;
        }


        const channel = client.channels.cache.get(interaction.channelId) as any;
        const paginatedEmbed = await handler.createTeamEmbedPaginated(team);

        await paginatedEmbed.send({
            message: `<@${interaction.user.id}> has consultado el equipo \`#${team.id}\``,
            options: {
                channel,
                ephemeral: true,
                interaction: interaction as Interaction,
                followUp: true
            }
        })
    }

    public async listarSubcommand(client: Client, interaction: CommandInteraction, handler: TeamsHandler, gamemode: TeamGameMode) {
        const teams = await handler.getTeamsByGamemode(gamemode);

        await interaction.deferReply({ephemeral: true});

        if(teams.length === 0) {
            await interaction.followUp({ content: ":x: No se encontraron equipos.", ephemeral: true });
            return;
        }

        const channel = client.channels.cache.get(interaction.channelId) as any;
        const paginatedEmbed = await handler.createTeamsEmbedPaginated(teams, gamemode);

        await paginatedEmbed.send({
            message: `<@${interaction.user.id}>`,
            options: {
                channel,
                ephemeral: true,
                interaction: interaction as Interaction,
                followUp: true
            }
        })
    }

    public async borrarCapturaSubcommand(client: Client, interaction: CommandInteraction, handler: TeamsHandler, gamemode: TeamGameMode) {
        const counter = interaction.options.data[0].options;
        if (!counter) {
            await interaction.reply({ content: "Error: No se encontró el grupo", ephemeral: true });
            return;
        };

        let id = interaction.options.get("id")?.value?.toString().trim();
        let screenshotID = interaction.options.get("screenshot")?.value?.toString().trim();

        await interaction.deferReply({ephemeral: true})

        if(id?.startsWith("#")) {
            id = id.substring(1);
        }

        if(screenshotID?.startsWith("#")) {
            screenshotID = screenshotID.substring(1);
        }

        const team = await handler.getTeam(id!);

        if (!team || team === undefined || team === null) {
            await interaction.followUp({ content: ":x: No se encontró el equipo.", ephemeral: true })
            return;
        }

        const database = interaction.client.database as Database;
        const screenshots: Screenshot[] = [];

        if(team.screenshots.length === 0) {
            await interaction.followUp({ content: ":x: No hay capturas para eliminar.", ephemeral: true })
            return;
        }

        for await (const screenshot of team.screenshots) {
            if(screenshot.id !== screenshotID) {
                screenshots.push(screenshot);
            }
        }

        if(screenshots.length === team.screenshots.length) {
            await interaction.followUp({ content: ":x: No se encontró la captura.", ephemeral: true })
            return;
        }

        team.screenshots = screenshots;
        const response = await database.update(team.id, team);

        if (response) {
            await interaction.followUp({ content: "✅ Se ha eliminado la captura al equipo #`" + team.id + "`.", ephemeral: true });
        } else {
            await interaction.followUp({ content: ":x: No se ha podido eliminar la captura al equipo.", ephemeral: true });
        }

    }

    private generateRandomId(): string {
        const abc = "abcdefghijkmnopqrstuvwxyz0123456789";
        let id = "";
        for (let i = 0; i < 8; i++) {
            id += abc[Math.floor(Math.random() * abc.length)];
        }

        return id;
    }
}

export {
    SubcommandUtil
}