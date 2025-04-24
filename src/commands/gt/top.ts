import {Command, ChoiceType} from "../../class/Command.ts";
import { Client, CommandInteraction } from "npm:discord.js";
import { Embed } from "npm:@notenoughupdates/discord.js-builders";

class TOP extends Command {
    constructor() {
        super({
            name: "top",
            description: "Qué top quedarías si hubiesen x30 tus?",
            choices: [
                {
                    type: ChoiceType.STRING,
                    name: "nombre",
                    description: "Tu nombre",
                    required: true
                },
                {
                    type: ChoiceType.STRING,
                    name: "dmg_total",
                    description: "Daño total en raid",
                    required: true
                },
                {
                    type: ChoiceType.NUMBER,
                    name: "temporada",
                    description: "Temporada de raid"
                }
            ]
        });
    }

    async run(client: Client, interaction: CommandInteraction) {
        try {
            const name = interaction.options.get("nombre")?.value as string;
            await interaction.deferReply();
            let season = interaction.options.get("temporada")?.value as number;
            if(!season) {
                season = 104;
            }

            const [globalData, latamData] = await Promise.all([
                this.getLeaderboard(season),
                this.getLeaderboard(season, "LATAM")
            ]);
            
            const damageInput = interaction.options.get("dmg_total")?.value as string;
            if (!damageInput || isNaN(parseFloat(damageInput))) {
              interaction.editReply({ content: ":x: Debes especificar el daño total en raid." });
              return;
            }
            
            const userDamage = parseFloat((damageInput).replace(/,/g, "").replace(/\./g, ""));
            const totalDamage = userDamage * 30;
            
            let globalRank = 1;
            for (const player of globalData.leaderboard) {
              if (totalDamage > player.totalDmg) {
                break;
              }
              globalRank++;
            }
            
            let latamRank = 1;
            for (const player of latamData.leaderboard) {
              if (totalDamage > player.totalDmg) {
                break;
              }
              latamRank++;
            }
            
            const vultureIndex = globalData.leaderboard.findIndex(p => p.name === "VultureSupremacy");
            const vultureRank = vultureIndex !== -1 ? globalData.leaderboard[vultureIndex].rank : -1;
            
            let puestoGlobal = "";
            if (vultureRank !== -1) {
              if (globalRank < vultureRank) {
                puestoGlobal = `Estarías ${vultureRank - globalRank} puestos por encima de VultureSupremacy (actual #${vultureRank}).`;
              } else if (globalRank > vultureRank) {
                puestoGlobal = `Estarías ${globalRank - vultureRank} puestos por debajo de VultureSupremacy (actual #${vultureRank}).`;
              } else {
                puestoGlobal = "Estarías en el mismo puesto que VultureSupremacy!";
              }
            }

            let globalTxt = "";
            if (globalRank <= 1) {
              globalTxt = "\n🌎 **Global:** #1 🏆";
            } else if (globalRank > 200) {
              globalTxt = "\n🌎 **Global:** Fuera del top 200";
            } else {
              globalTxt = `\n🌎 **Global:** #${globalRank}`;
            }

            let latamTxt = "";
            if (latamRank <= 1) {
              latamTxt = "\n🌮 **LATAM:** #1 🏆";
            } else if (latamRank > 200) {
              latamTxt = "\n🌮 **LATAM:** Fuera del top 200";
            } else {
              latamTxt = `\n🌮 **LATAM:** #${latamRank}`;
            }

            let nearbyTxt = "";
            if (globalRank <= 200 && globalRank > 1) {
              const guilds = globalData.leaderboard.slice(Math.max(0, globalRank - 2), globalRank + 1);
              nearbyTxt = "\n\n🌎 **Comparación global cercana:**";
              for (const guild of guilds) {
                nearbyTxt += `\n- #${guild.rank} ${guild.name}: ${guild.totalDmg.toLocaleString()}`; 
              }
            }

            if (latamRank <= 200 && latamRank > 1) {
              const latamGuilds = latamData.leaderboard.slice(Math.max(0, latamRank - 2), latamRank + 1);
              nearbyTxt += "\n\n🌮 **Comparación LATAM cercana:**";
              for (const guild of latamGuilds) {
                nearbyTxt += `\n- #${guild.rank} ${guild.name}: ${guild.totalDmg.toLocaleString()}`; 
              }
            }

            let embedDescription = `**Resultados para ${name} (x30 ${name}'s):**\n`;
            embedDescription += `* Daño total: ${userDamage.toLocaleString()}\n`;
            embedDescription += `* Daño x30: ${totalDamage.toLocaleString()}\n`;
            embedDescription += globalTxt + latamTxt;
            embedDescription += puestoGlobal ? `\n\n${puestoGlobal}` : "";
            embedDescription += nearbyTxt;

            const embed = new Embed()
            .setDescription(embedDescription)
            .setColor(0xe30e4a)
            .setAuthor({ 
                name: `Cálculo de top para: ${name} (S${season})`, 
                iconURL: interaction.user.avatarURL() ?? "https://r2.e-z.host/a992a427-74c5-45d9-8edb-61722d83e2b4/r6taxujw.png" 
            })
            .setFooter({ 
                text: `${interaction.user.username} | Info de gtales.top`, 
                iconURL: "https://r2.e-z.host/a992a427-74c5-45d9-8edb-61722d83e2b4/r6taxujw.png" 
            })
            .setTimestamp(Date.now())
            .setThumbnail("https://r2.e-z.host/a992a427-74c5-45d9-8edb-61722d83e2b4/2v5340b9.webp");

            interaction.editReply({ embeds: [embed] });
          } catch (error) {
            console.error("Error:", error);
            interaction.followUp({ 
                content: ":x: Ocurrió un error al ejecutar el comando, por favor intenta nuevamente: " + error, 
                ephemeral: true 
            });
          }
    }

    async getLeaderboard(season: number, region?: string): Promise<LeaderboardData> {
        const url = region 
            ? `https://www.gtales.top/api/raids/leaderboard?season=${season}&region=${region}`
            : `https://www.gtales.top/api/raids/leaderboard?season=${season}`;
            
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        return await response.json();
    }
}

interface Player {
    rank: number;
    name: string;
    totalDmg: number;
    region: string;
}
  
interface LeaderboardData {
    season: number;
    leaderboard: Player[];
}

export default TOP;