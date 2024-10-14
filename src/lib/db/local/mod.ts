import { Database } from "../mod.ts";
import { Team } from "../../team/mod.ts";

class LocalDatabase extends Database {
    public get(key: string): Promise<Team> {
        return Promise.resolve(undefined!);
    }

    public remove(key: string): Promise<Team> {
        return Promise.resolve(undefined!);
    }

    public save(key: string, value: Team): Promise<Team> {
        return Promise.resolve(undefined!);
    }

    public getAll(): Promise<Team[]> {
        return Promise.resolve([]);
    }

    public connect(): Promise<void> {
        return Promise.resolve();
    }
}