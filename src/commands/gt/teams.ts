
import { Command, ChoiceType } from "../../class/Command.ts";
import { Client, CommandInteraction, AutocompleteInteraction } from "npm:discord.js";
import { Embed } from "npm:@notenoughupdates/discord.js-builders";
import { TeamGameMode, TeamsHandler, type Screenshot } from "../../lib/team/mod.ts";
import EZ_Host from "../../lib/e-z_host/mod.ts";
import { PaginatedEmbed } from "npm:embed-paginator";

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
                },
                {
                    type: ChoiceType.SUB_COMMAND,
                    name: "crear",
                    description: "Crear equipo nuevo",
                    options: [
                        {
                            type: ChoiceType.STRING,
                            name: "gamemode",
                            description: "Modo del equipo",
                            required: true,
                            autocomplete: true
                        },
                        {
                            type: ChoiceType.STRING,
                            name: "description",
                            description: "Descripción del equipo",
                            required: true
                        },
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
                        {
                            type: ChoiceType.ATTACHMENT,
                            name: "screenshot",
                            description: "Imagen de registro de batalla con victoria"
                        }
                    ]
                }
            ]
        });
    }

    async run(client: Client, interaction: CommandInteraction) {
        if (!client.teams) {
            interaction.reply({ content: ":x: Ocurrió un error en la carga de datos, por favor intenta nuevamente", ephemeral: true });
            return;
        }
        /*const embed = new Embed()
            .setTitle("Commands")
            .setDescription("hi");*/
        const teamsHandler = client.teams as TeamsHandler;

        if (interaction.options.data[0].name === "counter") {
            await this.counterSubcommand(client, interaction, teamsHandler);
        } else if (interaction.options.data[0].name === "crear") {
            if(this.settings.admin && interaction.user.id === Deno.env.get("ADMIN_ID")) {
                this.crearSubcommand(client, interaction, teamsHandler);
            } else {
                interaction.reply({ content: ":x: No tienes permisos para crear equipos", ephemeral: true });
            }
        }
    }

    public async counterSubcommand(client: Client, interaction: CommandInteraction, handler: TeamsHandler) {
        const counter = interaction.options.data[0].options;
        if (!counter) {
            interaction.reply({ content: "Error: No se encontró el grupo" });
            return;
        };
        interaction.reply({ content: "<a:loading:1296272884955877427> Consultando la base de datos..." })
        const leader = counter[0]?.value?.toString();
        const member2 = counter[1]?.value?.toString();
        const member3 = counter[2]?.value?.toString();
        const member4 = counter[3]?.value?.toString();

        const teamMembers = await handler.generateTeamMembers([leader!, member2!, member3!, member4!]);
        interaction.editReply({ content: "<a:loading:1296272884955877427> Creando instancia de equipo..." })
        const team = await handler.getTeamByMembers('COUNTERS', teamMembers);

        if (!team) {
            interaction.editReply({ content: ":x: Error: No se encontró el equipo." })
            return;
        }

        //const embed = handler.createTeamEmbed(team);
        //const rows = handler.getScrollButtons() as any;

        await interaction.deleteReply();

        const channel = client.channels.cache.get(interaction.channelId);
        const paginatedEmbed = handler.createTeamEmbedPaginated(team);

        await paginatedEmbed.send({
            message: `<@${interaction.user.id}>`,
            options: {
                channel
            }
        })

        //interaction.editReply({ embeds: [embed], content: "", components: [rows] });
    }

    public async crearSubcommand(client: Client, interaction: CommandInteraction, teamsHandler: TeamsHandler): Promise<void> {
        const ezApi = client.ez_api as EZ_Host;

        const gamemode = interaction.options.get("gamemode")?.value?.valueOf();
        const description = interaction.options.get("description")?.value?.toString();
        const leader = interaction.options.get("leader")?.value?.toString();
        const member2 = interaction.options.get("member2")?.value?.toString();
        const member3 = interaction.options.get("member3")?.value?.toString();
        const member4 = interaction.options.get("member4")?.value?.toString();
        const screenshot = interaction.options.get("screenshot")?.attachment?.url;
        const screenshots: Screenshot[] = [];

        await interaction.reply({ content: "<a:loading:1296272884955877427> Iniciando creación de equipo..." });

        let realGameMode: TeamGameMode;
        if (gamemode === "COLOSSEUM") {
            realGameMode = TeamGameMode.COLOSSEUM;
        } else if (gamemode === "RAID") {
            realGameMode = TeamGameMode.RAID;
        } else if (gamemode === "TETIS") {
            realGameMode = TeamGameMode.TETIS;
        } else {
            interaction.editReply({ content: "Error: Modo de equipo no reconocido" });
            return;
        }

        if (!gamemode || !description || !leader || !member2 || !member3 || !member4) {
            interaction.editReply({ content: "Error: Faltan parámetros" });
            return;
        }

        if (screenshot) {
            interaction.editReply({ content: "<a:loading:1296272884955877427> Subiendo imagen al host..." });
            const hostedUrl = await ezApi.createUrl(screenshot);
            if (hostedUrl) {
                screenshots.push({
                    author: interaction.user.username,
                    url: hostedUrl
                });
            } else {
                interaction.editReply({ content: "Error: No se pudo crear la imagen de registro de batalla" });
                return;
            }
        }

        interaction.editReply({ content: "<a:loading:1296272884955877427> Registrando el equipo..." });
        const members = await teamsHandler.generateTeamMembers([leader, member2, member3, member4]);
        const newTeam = await teamsHandler.createTeamObject("COUNTERS", realGameMode, description, members, screenshots);

        const success = await teamsHandler.addTeam(newTeam);
        if (success) {
            const embed = teamsHandler.createTeamEmbed(newTeam);
            interaction.editReply({ content: "✅ Equipo registrado con éxito. ID: `" + newTeam.id + "`", embeds: [embed] });
        } else {
            interaction.editReply({ content: ":x: Error: No se pudo registrar el equipo" });
        }
    }

    public getPresets(interaction: CommandInteraction, teamsHandler: TeamsHandler): void {

    }



    public override async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        if (interaction.options.getFocused(true).name === "gamemode") {
            await this.gamemodeAutocomplete(interaction);
            return;
        }
        await this.heroAutocomplete(interaction, interaction.client.teams.TwoStarHeros());
    }
}




export default Help;