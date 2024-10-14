import { Team } from "../team/mod.ts";

abstract class Database {
    public abstract get(key: string): Promise<Team>;
    public abstract remove(key: string): Promise<Team>;
    public abstract save(key: string, value: Team): Promise<Team>;
    public abstract getAll(): Promise<Team[]>;
}

class MongoDB extends Database {
    public get(key: string): Promise<Team> {
        return Promise.resolve(undefined!);
    }

    public remove(key: string): Promise<Team> {
        return Promise.resolve(undefined!);
    }

    public save(key: string, value: Team): Promise<Team> {
        return Promise.resolve(undefined!);
        //return this.teams.set(key, value);
    }

    public getAll(): Promise<Team[]> {
        return Promise.resolve([]);
    }
}

class LocalDatabase extends Database {
    public get(key: string): Promise<Team> {
        return Promise.resolve(undefined!);
    }

    public remove(key: string): Promise<Team> {
        return Promise.resolve(undefined!);
    }

    public save(key: string, value: Team): Promise<Team> {
        return Promise.resolve(undefined!);
        //return this.teams.set(key, value);
    }

    public getAll(): Promise<Team[]> {
        return Promise.resolve([]);
    }
}

export {
    Database,
    MongoDB,
    LocalDatabase
}