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
    public abstract databaseName(): string;
}

enum DatabaseName {
    MONGODB = "mongodb",
    LOCAL = "local"
}

async function loadDatabase(name: DatabaseName): Promise<Database> {
    switch(name) {
        case DatabaseName.MONGODB:
            return new (await import("./mongodb/mod.ts")).default();
        case DatabaseName.LOCAL:
            return new (await import("./local/mod.ts")).default();
        default:
            return new (await import("./local/mod.ts")).default();
    }
}

export {
    Database,
    DatabaseName,
    loadDatabase
}