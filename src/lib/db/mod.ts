import { Team } from "../team/mod.ts";

abstract class Database {
    public abstract get(key: string): Promise<Team>;
    public abstract remove(key: string): Promise<void>;
    public abstract set(key: string, value: Team): Promise<boolean>;
    public abstract getAll(): Promise<Team[]>;
    public abstract connect(): Promise<void>;
    public abstract close(): Promise<boolean>;
    public abstract save(): Promise<void>;
    public abstract isConnected(): boolean;
}

export {
    Database
}