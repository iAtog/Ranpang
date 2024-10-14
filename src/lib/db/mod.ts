import { Team } from "../team/mod.ts";

abstract class Database {
    public abstract get(key: string): Promise<Team>;
    public abstract remove(key: string): Promise<Team>;
    public abstract save(key: string, value: Team): Promise<Team>;
    public abstract getAll(): Promise<Team[]>;
    public abstract connect(): Promise<void>;
}

export {
    Database
}