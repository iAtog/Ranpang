import { Database } from "../mod.ts";
import { Team } from "../../team/mod.ts";

class MongoDB extends Database {
    public get(key: string): Promise<Team> {
        return Promise.resolve(undefined!);
    }

    public remove(key: string): Promise<Team> {
        return Promise.resolve(undefined!);
    }

    public set(key: string, value: Team): Promise<boolean> {
        return Promise.resolve(undefined!);
    }

    public getAll(): Promise<Team[]> {
        return Promise.resolve([]);
    }

    public connect(): Promise<void> {
        return Promise.resolve();
    }

    public close(): Promise<boolean> {
        return Promise.resolve(true);
    }
}

export default MongoDB;