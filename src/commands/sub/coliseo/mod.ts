import { CommandInteraction, Client } from "npm:discord.js";
import { TeamGameMode, TeamsHandler, TeamType } from "../../../lib/team/mod.ts";
import SubcommandsClass from "../../../class/subcommand.class.ts";
import { Embed } from "npm:@notenoughupdates/discord.js-builders";
import { SubcommandUtil } from "../../../lib/subcommand/mod.ts";

class ColiseoSubCommand extends SubcommandsClass {

    constructor(client: Client) {
        super();

        this.addSubcommand("counters", this.countersSubcommand);
        this.addSubcommand("presets", this.presetsSubcommand);
        this.addSubcommand("crear_equipo", this.crearEquipoSubcommand, true);
        this.addSubcommand("añadir_captura", this.anadirCapturaSubcommand, true);
        this.addSubcommand("eliminar_equipo", this.eliminarEquipoSubcommand, true);
        this.addSubcommand("ver_equipo", this.verEquipoSubcommand);
        this.addSubcommand("listar", this.listarSubcommand);
        this.addSubcommand("info", this.infoSubcommand);
        this.addSubcommand("añadir_captura_id", this.anadirCapturaIDSubcommand, true);
        this.addSubcommand("borrar_captura", this.borrarCapturaSubcommand, true);
        this.addSubcommand("actualizar_ids", this.actualizarIDsSubcommand, true);
    }

    public async countersSubcommand(client: Client, interaction: CommandInteraction, util: SubcommandUtil) {
        //await this.runTeam(client, interaction, TeamType.COUNTERS);
        await util.runTeam(client, interaction, client.teams as TeamsHandler, TeamType.COUNTERS, TeamGameMode.COLOSSEUM);
    }

    public async presetsSubcommand(client: Client, interaction: CommandInteraction) {
        //await this.runTeam(client, interaction, TeamType.PRESET);
        await this.util.runTeam(client, interaction, client.teams as TeamsHandler, TeamType.PRESET, TeamGameMode.COLOSSEUM);    
    }

    public async crearEquipoSubcommand(client: Client, interaction: CommandInteraction) {
        await this.util.crearSubcommand(client, interaction, client.teams as TeamsHandler, TeamGameMode.COLOSSEUM)
    }

    public async anadirCapturaSubcommand(client: Client, interaction: CommandInteraction) {
        await this.util.addScreenshotSubcommand(client, interaction, client.teams as TeamsHandler, TeamGameMode.COLOSSEUM);
    }
    
    public async eliminarEquipoSubcommand(client: Client, interaction: CommandInteraction) {
        await this.util.deleteTeamSubcommand(client, interaction, client.teams as TeamsHandler, TeamGameMode.COLOSSEUM)
    }

    public async verEquipoSubcommand(client: Client, interaction: CommandInteraction) {
        await this.util.verEquipoSubcommand(client, interaction, client.teams as TeamsHandler, TeamGameMode.COLOSSEUM);
    }

    public async listarSubcommand(client: Client, interaction: CommandInteraction) {
        await this.util.listarSubcommand(client, interaction, client.teams as TeamsHandler, TeamGameMode.COLOSSEUM);
    }

    public async infoSubcommand(_client: Client, interaction: CommandInteraction) {
        const embed = new Embed()
            .setDescription("Este bot tiene la finalidad de crear una guía ya sean de presets o counters para coliseo en **Guardian Tales**.\n\nSi algun contenido que te haya mostrado el bot no te funciona, no te preocupes, puedes reintentarlo!\n\nEspero que ganes todas sus batallas, " + interaction.user.displayName + ", nos vemos. :wave:")
            .setFooter({ text: interaction.user.username, iconURL: !interaction.user.avatarURL()! ? "https://i.pinimg.com/originals/f1/0f/f7/f10ff70a7155e5ab666bcdd1b45b726d.jpg" : interaction.user.avatarURL()!})
            .setThumbnail("https://r2.e-z.host/a992a427-74c5-45d9-8edb-61722d83e2b4/ch84t1vn.png")
            .setColor(0xe30e4a)
            .setTitle("Información del comando: __/coliseo__")
        await interaction.reply({embeds: [embed], ephemeral: true})
    }

    public async anadirCapturaIDSubcommand(client: Client, interaction: CommandInteraction) {
        await this.util.addScreenshotWithIDSubcommand(client, interaction, client.teams as TeamsHandler);
    }

    public async borrarCapturaSubcommand(client: Client, interaction: CommandInteraction) {
        await this.util.borrarCapturaSubcommand(client, interaction, client.teams as TeamsHandler, TeamGameMode.COLOSSEUM);
    }

    public async actualizarIDsSubcommand(client: Client, interaction: CommandInteraction) {
        await this.util.actualizarIDs(client, interaction, client.teams as TeamsHandler);
    }
/*
    public async runTeam(client: Client, interaction: CommandInteraction, type: TeamType) {
        await this.util.runTeam(client, interaction, this.teamsHandler, type, this.gamemode);
    }*/

}

export default ColiseoSubCommand;