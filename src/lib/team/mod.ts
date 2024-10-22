import { Database } from "../db/mod.ts";
import { Embed, ButtonComponent, ActionRowComponent } from "npm:@notenoughupdates/discord.js-builders";
import { ButtonBuilder,  ActionRowBuilder } from "npm:discord.js";
import { PaginatedEmbed } from "../embedpaginator/mod.ts";

class TeamsHandler {
    private database: Database;

    constructor(database: Database) {
        this.database = database;
    }

    public getTeams(): Promise<Team[]> {
        return this.database.getAll();
    }

    public async getTeamsByGamemode(gamemode: TeamGameMode): Promise<Team[]> {
        const teams = await this.database.getAll();
        return new Promise<Team[]>((resolve, _reject) => {
            const teamList: Team[] = [];
            for (const team of teams) {
                if(team.gamemode.toString().toUpperCase() === gamemode.toString().toUpperCase()) {
                    teamList.push(team);
                }
            }
            resolve(teamList);
        });
    }

    public getTeam(id: string): Promise<Team> {
        return this.database.get(id);
    }

    public saveTeams(): void {
        this.database.save();
    }

    public async addTeam(team: Team): Promise<boolean> {
        return await this.database.set(team.id, team);
    }

    public existsHero(id: string): Promise<boolean> {
        return new Promise<boolean>((resolve, _reject) => {
            this.getCustomHeros().then(async (heroes) => {
                for await (const hero of heroes) {
                    if (hero.key === id) {
                        resolve(true);
                        break;
                    }
                }
                
                resolve(false);
            });
            
        });
    }
    public async getMembersWithEmoji(team: Team): Promise<string[]> {
        const members: string[] = [];

        for await (const member of team.members) {
            const emoji = await this.getHeroEmoji(member.key);
            let message = `${emoji} ${this.mayus(member.name)}`;
            if (member.key === team.members[0].key) {
                message += " :crown:";
            }
            members.push(message);
        }

        return members;
    }
    public async createTeamEmbed(team: Team): Promise<Embed> {
        const members: string[] = await this.getMembersWithEmoji(team);

        const subida = team.screenshots.length > 0 ? team.screenshots[0].author : "Nadie";
        const embed = new Embed()
            .setTitle("Equipo #``" + team.id + "`` (" + this.mayus(team.type.toLowerCase()) + ")")
            .setDescription(`${team.description}\n\n> Imagen subida por: **${subida}**`)
            .setColor(0x0eb482)
            .setFooter({ text: team.id });

        embed.addFields({ 
            name: "Miembros", 
            value: members.join('\n'), 
            inline: true 
        }, {
            name: "Modo de juego",
            value: this.translateGamemode(team.gamemode),
            inline: true
        });

        if (team.screenshots.length > 0) {
            embed.setImage(team.screenshots[0].url);
        } else {
            embed.setImage("https://t3.ftcdn.net/jpg/04/84/88/76/360_F_484887682_Mx57wpHG4lKrPAG0y7Q8Q7bJ952J3TTO.jpg");
        }

        embed.setTimestamp(team.createdAt);
        return embed;
    }

    public async createTeamsEmbedPaginated(teams: Team[], gamemode: TeamGameMode): Promise<PaginatedEmbed> {
        const fields = [];
        for await (const team of teams) {
            fields.push(await this.createField(team));
        }

        const embed = new PaginatedEmbed({
            itemsPerPage: 6,
            paginationType: "field",
            showFirstLastBtns: false,
            nextBtn: "➡",
            prevBtn: "⬅",
            duration: (60 * 1000),
        })
        .setFields(fields)
        .setTimestamp(Date.now())
        .setColours(this.duplicateValue('Aqua', teams.length))
        .setDescriptions(["# Lista de equipos para " + this.translateGamemode(gamemode).toLowerCase()])
        .setFooters(this.duplicateValue({ text: "{page}" }, teams.length))

        return embed;
    }

    private async createField(team: Team) {
        return {
            name: "Equipo #" + team.id + " (" + this.mayus(team.type.toLowerCase()) + ")",
            value: (await this.getMembersWithEmoji(team)).join('\n'),
            inline: true
        }
    }

    public async createTeamEmbedPaginated(team: Team): Promise<PaginatedEmbed> {
        const pages = team.screenshots.length;
        //console.log(team)
        const members: string[] = [];

        for await (const member of team.members) {
            const emoji = await this.getHeroEmoji(member.key);
            let message = `${emoji} ${this.mayus(member.name)}`;
            if (member.key === team.members[0].key) {
                message += " :crown:";
            }
            members.push(message);
        }// \nFecha de creación: ${team.createdAt.toLocaleString()}
        const descriptions = this.duplicateValue(`## Equipo **\`${team.id}\`** (${this.mayus(team.type.toLowerCase())})\n\n${team.description}`, pages, team.screenshots.map(screenshot => (`\n\n> Imagen subida por: **${screenshot.author}**`)));
        //console.log("Descriptions: ", descriptions);
        
        const fields = [{ 
            name: "# Miembros", 
            value: members.join('\n'), 
            inline: true 
        }, {
            name: "# Modo de juego",
            value: this.translateGamemode(team.gamemode),
            inline: true
        }];
        
        const images = pages > 0 ? team.screenshots.map(screenshot => screenshot.url) : ["https://t3.ftcdn.net/jpg/04/84/88/76/360_F_484887682_Mx57wpHG4lKrPAG0y7Q8Q7bJ952J3TTO.jpg"]
        const embed = new PaginatedEmbed({
            itemsPerPage: 1,
            paginationType: "description",
            showFirstLastBtns: false,
            nextBtn: "➡",
            prevBtn: "⬅",
            duration: (60 * 1000),
        })
        .setDescriptions(descriptions)
        .setImages(images)
        .setFields(fields)
        .setColours(this.duplicateValue("Gold", pages))
        .setTimestamp(team.createdAt)
        //.setAuthors(this.duplicateValue({ name: "Equipo '" + team.id + "' (" + this.mayus(team.type.toLowerCase()) + ")", iconURL: "https://r2.e-z.host/a992a427-74c5-45d9-8edb-61722d83e2b4/r6taxujw.png" }, pages))
        //.setTitles(this.duplicateValue("Equipo #``" + team.id + "`` (" + this.mayus(team.type.toLowerCase()) + ")", pages))
        .setFooters(this.duplicateValue({ text: `${team.id} | {page}` }, pages))

        return embed;
    }

    public async getHeroEmoji(key: string): Promise<string> {
        const heros = await this.getCustomHeros();
        let emoji = "";
        for await (const hero of heros) {
            if (hero.key === key) {
                emoji = hero.emoji;
                break;
            }
        }

        return emoji;
    }

    // deno-lint-ignore no-explicit-any
    public duplicateValue(value: string | object, times: number, addition: string[] = []): any[] {
        if(times === 0) {
            return [value];
        } else {
            if(addition.length === 0) {
                const newArray = [];
                for (let i = 0; i < times; i++) {
                    newArray.push(value);
                }
                return newArray;
            } else {
                const newArray = [];
                for (let i = 0; i < times; i++) {
                    newArray.push(value + (addition[i] ?? ""));
                }
                return newArray;
            }
        }
    }

    private mayus(str: string) {
        let newStr = "";

        newStr += str.charAt(0).toUpperCase();
        newStr += str.slice(1);

        return newStr;
    }

    public getTeamByMembers(type: keyof typeof TeamType, members: TeamMember[], gamemode: TeamGameMode): Promise<Team> {
        return new Promise<Team>((resolve, _reject) => {
            this.database.getAll().then(async (teams) => {
                for await (const team of teams) {
                    if (team.type !== type.toString()) 
                        continue;
                    
                    //console.log(team.gamemode.toString().toUpperCase(), gamemode.toString());
                    if(team.gamemode.toString().toUpperCase() !== gamemode.toString().toUpperCase()) continue;
                    if (team.members.length !== members.length) continue;
                    if (members[0].key !== team.members[0].key) continue;
                    

                    const companions1 = new Set(members.slice(1).map(member => member.key));
                    const companions2 = new Set(team.members.slice(1).map(member => member.key));

                    if (companions1.size !== companions2.size)
                        continue;
        

                    let isEqual = true;

                    for await (const key of companions1) {
                        if (!companions2.has(key)) {
                            isEqual = false;
                        }
                    }

                    if (!isEqual) continue;

                    resolve(team);
                    break;
                }

                resolve(undefined!);

            })
        })
    }

    public TwoStarHeros(): string[] {
        return []
    }

    public createTeamObject(type: keyof typeof TeamType, gamemode: TeamGameMode, description: string, members: TeamMember[], screenshots: Screenshot[] = []): Team {
        const id = createTeamId();

        return {
            id,
            type,
            gamemode,
            description,
            members,
            screenshots,
            createdAt: new Date()
        };
    }

    public translateGamemode(gamemode: TeamGameMode): string {
        if(gamemode.toUpperCase() === "COLOSSEUM") {
            return "Coliseo";
        } else if(gamemode.toUpperCase() === "RAID") {
            return "Asalto";
        } else if(gamemode.toUpperCase() === "TETIS") {
            return "Tetis heroes";
        } else {
            console.log("Unknown gamemode: " + gamemode);
            return "Desconocido.";
        }
    }

    /**
     * IN ORDER PLEASE
     * @param heros 0: LIDER, 1: MEMBER2, 2: MEMBER3, 3: MEMBER4
     * @returns TEAM MEMBERS {key: string, name: string}[]
     */
    public async generateTeamMembers(heros: string[]): Promise<TeamMember[]> {
        const members: TeamMember[] = [];
        for await (const hero of heros) {
            const heroApi = await this.getCustomHero(hero);
            if (heroApi) {
                members.push({
                    key: heroApi.key,
                    name: heroApi.name
                })
            }
        }

        return members;
    }

    public async getCustomHeros(): Promise<CustomHero[]> {
        const heros = await import("../../../local/heros.json", {
            with: { type: "json" },
        });
        
        const list = heros.default as CustomHero[];
        return list;
    }

    public getCustomHero(name: string): Promise<CustomHero> {
        return new Promise<CustomHero>((resolve, _reject) => {
            this.getCustomHeros().then(async (heroes) => {
                for await (const hero of heroes) {
                    if (hero.key === name) {
                        resolve(hero);
                        break;
                    }
                }
                
                resolve(undefined!);
            }); 
        });
    }

    public async getHero(name: string): Promise<Heroe> {
        const response = await fetch("https://www.gtales.top/api/heroes?hero=" + name);
        const data = await response.json();

        if (data.error) {
            return undefined!;
        }

        return data as Heroe;
    }

    public async getHeroes(): Promise<CustomHero[]> {
        return await this.getCustomHeros()
    }
}

function createTeamId(): string {
    const abc = "abcdefghijkmnopqrstuvwxyz0123456789";
    let id = "";
    for (let i = 0; i < 8; i++) {
        id += abc[Math.floor(Math.random() * abc.length)];
    }

    return id;
}

enum TeamType {
    COUNTERS = "COUNTERS",
    PRESET = "PRESET"
}

interface Team {
    id: string;
    type: string;
    gamemode: TeamGameMode;
    description: string;
    members: TeamMember[];
    screenshots: Screenshot[];
    createdAt: Date;
}

interface Screenshot {
    author: string;
    url: string;
}

interface TeamMember {
    name: string;
    key: string;
}

interface CustomHero extends TeamMember {
    emoji: string;
}

enum TeamGameMode {
    COLOSSEUM = "Colosseum",
    RAID = "Raid",
    TETIS = "Tetis"
}

// HERO INFO:

interface Heroe {
    key: string;
    available: boolean;
    atr: string;
    name: string;
    role: string;
    element: string;
    collection: string;
    party: string;
    rarity: string;
    stats: HeroStats;
    na: HeroNormalAttack;
    ability: HeroAbility;
    chain: HeroChain;
    weapon: HeroWeapon;
}

interface HeroStats {
    atk: string;
    hp: string;
    def: string;
    reduc: string;
    heal: string;
}

interface HeroNormalAttack {
    title: string;
    naDescription: string;
    altDescription: string;
    altCd: string;
}

interface HeroAbility {
    title: string;
    description: string;
}

interface HeroChain {
    title: string;
    description: string;
    stun: string;
}

interface HeroWeapon {
    name: string;
    effect: string;
    type: string;
    dmg: string;
    atk: string;
    stats: string;
    options: string;
    collection: string;
    mlb: string;
    engraving: string;
    skill: WeaponSkill;
}

interface WeaponSkill {
    title: string;
    description: string;
    stun: string;
    level: string;
    dmg: string;
    cd: string;
}

export {
    TeamsHandler,
    TeamGameMode,
    createTeamId,
    TeamType
}

export type {
    Team,
    TeamMember,
    Heroe,
    Screenshot
}