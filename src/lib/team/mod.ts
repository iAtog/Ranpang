import { Database } from "../db/mod.ts";
import { Embed, ButtonComponent, ActionRowComponent } from "npm:@notenoughupdates/discord.js-builders";
import { ButtonBuilder,  ActionRowBuilder } from "npm:discord.js";
import { PaginatedEmbed } from "npm:embed-paginator";

class TeamsHandler {
    private database: Database;

    constructor(database: Database) {
        this.database = database;
    }

    public getTeams(): Promise<Team[]> {
        return this.database.getAll();
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

    public createTeamEmbed(team: Team): Embed {
        const embed = new Embed()
            .setTitle("Equipo #``" + team.id + "`` (" + this.mayus(team.type.toLowerCase()) + ")")
            .setDescription("**" + team.description + "**")
            .setColor(0x0eb482)
            .setFooter({ text: team.id });

        embed.addFields({ 
            name: "Miembros", 
            value: team.members.map(member => member.name).join("\n"), 
            inline: true 
        }, {
            name: "Modo de juego",
            value: this.mayus(team.gamemode.toLowerCase()),
            inline: true
        });
        if (team.screenshots.length > 0) {
            embed.setImage(team.screenshots[0].url);
        } else {
            embed.setImage("https://t3.ftcdn.net/jpg/04/84/88/76/360_F_484887682_Mx57wpHG4lKrPAG0y7Q8Q7bJ952J3TTO.jpg");
        }

        embed.setTimestamp(team.createdAt);
        embed.addFields({
            name: "Imagen actual",
            value: "1/" + team.screenshots.length,
            inline: true
        })
        return embed;
    }

    public createTeamEmbedPaginated(team: Team): PaginatedEmbed {
        const pages = team.screenshots.length;

        const embed = new PaginatedEmbed({
            itemsPerPage: 1,
            paginationType: "description",
            showFirstLastBtns: false,
            useEmoji: true
        })
        .setDescriptions(this.duplicateValue(team.description, pages))
        .setImages(team.screenshots.map(screenshot => screenshot.url))
        .setFields([{ 
            name: "Miembros", 
            value: team.members.map(member => member.name).join("\n"), 
            inline: true 
        }, {
            name: "Modo de juego",
            value: this.mayus(team.gamemode.toLowerCase()),
            inline: true
        }])
        .setTitles(this.duplicateValue("Equipo #``" + team.id + "`` (" + this.mayus(team.type.toLowerCase()) + ")", pages))
        .setFooters(this.duplicateValue({ text: "{page}" }, pages))

        return embed;
    }

    // deno-lint-ignore no-explicit-any
    public duplicateValue(value: any, times: number): any[] {
        const newArray = [];
        for (let i = 0; i < times; i++) {
            newArray.push(value);
        }
        return newArray;
    }

    private mayus(str: string) {
        let newStr = "";

        newStr += str.charAt(0).toUpperCase();
        newStr += str.slice(1);

        return newStr;
    }

    public getTeamByMembers(type: keyof typeof TeamType, members: TeamMember[]): Promise<Team> {
        return new Promise<Team>((resolve, _reject) => {
            this.database.getAll().then(async (teams) => {
                for (const team of teams) {
                    if (team.type !== type.toString()) continue;
                    if (team.members.length !== members.length) continue;
                    if (members[0].key !== team.members[0].key) continue;

                    const companions1 = new Set(members.slice(1).map(member => member.key));
                    const companions2 = new Set(team.members.slice(1).map(member => member.key));

                    if (companions1.size !== companions2.size) continue;

                    let isEqual = true;

                    for await (let key of companions1) {
                        if (!companions2.has(key)) {
                            isEqual = false;
                        }
                    }

                    if (!isEqual) continue;

                    resolve(team);
                    break;
                }

            })
        })
    }

    public TwoStarHeros(): string[] {
        return [
            "eva", "whiteBeast", "loraine", "lavi", "favi", "aoba", "gremory", "rachel", "hekate",
            "marianne", "akayuki", "ranpang", "yuze", "aisha", "shapira", "dolf", "amy", "catherine"
        ]
    }
/*
    public getScrollButtons(): ActionRowBuilder {
        const scrollback = new ButtonBuilder() as unknown as any;
        scrollback.setCustomId("back");
        scrollback.setLabel("◀");
        scrollback.setStyle(ButtonStyle.Primary)

        const scrollforward = new ButtonBuilder() as unknown as any;
        scrollforward.setCustomId("forward")
        scrollforward.setLabel("▶");
        scrollforward.setStyle(ButtonStyle.Primary)

        const row = new ActionRowBuilder() as unknown as any;
	    row.addComponents(scrollback, scrollforward);

        return row;
    }*/
    /*
        public getTeam(members: TeamMember[]): Team {
            for (let i = 0; i < this.teams.length; i++) {
                const team = this.teams[i];
                if (team.members.length === members.length) {
                    let isEqual = true;
                    for (let j = 0; j < team.members.length; j++) {
                        if (team.members[j].key !== members[j].key) {
                            isEqual = false;
                            break;
                        }
                    }
                    if (isEqual) {
                        return team;
                    }
                }
            }
            //this.createTeam("COLOSSEUM", "Test", [{key: "test", name: "Test"}]);
            return undefined!; 
        }*/

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
    /**
     * IN ORDER PLEASE
     * @param heros 0: LIDER, 1: MEMBER2, 2: MEMBER3, 3: MEMBER4
     * @returns TEAM MEMBERS {key: string, name: string}[]
     */
    public async generateTeamMembers(heros: string[]): Promise<TeamMember[]> {
        const members: TeamMember[] = [];
        for await (const hero of heros) {
            const heroApi = await this.getHero(hero);
            if (heroApi) {
                members.push({
                    key: heroApi.key,
                    name: heroApi.name
                })
            }
        }

        return members;
    }

    public async getHero(name: string): Promise<Heroe> {
        const response = await fetch("https://www.gtales.top/api/heroes?hero=" + name);
        const data = await response.json();

        if (data.error) {
            return undefined!;
        }

        return data as Heroe;
    }

    public async getHeroes(): Promise<TeamMember[]> {
        const response = await fetch("https://www.gtales.top/api/heroes");
        const data = await response.json();

        if (data.error) {
            return [];
        }

        return data as TeamMember[];
    }
}

function createTeamId(): string {
    const abc = "abcdef0123456789";
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
    createTeamId
}

export type {
    Team,
    TeamMember,
    Heroe,
    Screenshot
}