import { Database } from "../mod.ts";
import { Team } from "../../team/mod.ts";

class LocalDatabase extends Database {

    // deno-lint-ignore no-explicit-any
    private json: any;
    private path: string;

    constructor(path: string = "./local/teams.json") {
        super();
        this.path = path;
    }

    public override get(key: string): Promise<Team> {
        const team = this.json[key];
        if(team) {
            return Promise.resolve(team);
        }

        return Promise.resolve(undefined!);
    }

    public override remove(key: string): Promise<void> {
        const team = this.json[key];
        if(team !== null) {
            const t = this.json;
            delete t[key];
            this.json = t;
            return Promise.resolve();
        }

        return Promise.resolve(undefined!);
    }

    public override set(key: string, value: Team): Promise<boolean> {
        if(this.json[key]) {
            Promise.resolve(false);
        }
        this.json[key] = value;
        return Promise.resolve(true);
    }

    public override getAll(): Promise<Team[]> {
        return Promise.resolve(Object.values(this.json));
    }

    public override async connect(): Promise<void> {
        if(!(await Deno.stat(this.path).then(stat => stat.isFile))) {
            await Deno.writeTextFile(this.path, "{}");
        }

        this.json = JSON.parse(await Deno.readTextFile(this.path));
        return Promise.resolve();
    }

    public override async close(): Promise<boolean> {
        await this.save();
        return Promise.resolve(true);
    }

    public override async save(): Promise<void> {
        await Deno.writeTextFile(this.path, JSON.stringify(this.json));
        return Promise.resolve();
    }

    public override isConnected(): boolean {
        return this.json !== undefined;
    }
}

export default LocalDatabase;