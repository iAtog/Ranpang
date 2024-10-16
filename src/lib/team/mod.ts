import { Database } from "../db/mod.ts";

class TeamsHandler {
    private teams: Team[] = [];
    private database: Database;

    constructor(database: Database) {
        this.database = database;
    }

    public getTeams(): Team[] {
        return [...this.teams];
    }

    public saveTeams(): void {
        // TODO: save teams
    }

    public loadTeams(): void {
        // TODO: load teams
    }

    public addTeam(team: Team) {
        this.teams.push(team);
    }

    public removeTeam(team: Team) {
        this.teams = this.teams.filter(t => t.id !== team.id);
    }

    public getCounter(members: TeamMember[]): Team {
        
    }
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

    public createTeam(gamemode: keyof typeof TeamGameMode, description: string, members: TeamMember[]): Team {
        const id = createTeamId();
        const team: Team = {
            id,
            gamemode: TeamGameMode[gamemode],
            description: description,
            members: members,
            screenshots: [],
            createdAt: new Date()
        };

        return team;
    }

    public generateTeamMembers(keys: string[]): TeamMember[] {
        const members: TeamMember[] = [];
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            members.push({
                key: key,
                name: key
            });
        }

        return members;
    }

    public async getHero(name: string): Promise<Heroe> { 
        const response = await fetch("https://www.gtales.top/api/heroes?hero=" + name);
        const data = await response.json();
        
        if(data.error) {
            return undefined!;
        }

        return data as Heroe;
    }

    public async getHeroes(): Promise<TeamMember[]> {
        const response = await fetch("https://www.gtales.top/api/heroes");
        const data = await response.json();

        if(data.error) {
            return [];
        }
        
        return data as TeamMember[];
    }
}

function createTeamId(): string {
    const abc = "ABCDEFabcdef0123456789";
    let id = "";
    for (let i = 0; i < 10; i++) {
        id += abc[Math.floor(Math.random() * abc.length)];
    }

    return id;
}

interface Team {
    id: string;
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