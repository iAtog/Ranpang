// deno-lint-ignore-file no-explicit-any
import * as mongoose from "npm:mongoose@^6.7";
import schema from './schema.ts';

import { Database } from "../mod.ts";
import { Team } from "../../team/mod.ts";

class MongoDB extends Database {

    public connection: mongoose.Connection | undefined;
    
    constructor() {
        super();
    }

    public get(key: string): Promise<Team> {
        return new Promise((resolve, reject) => {
            try {
                schema.findOne({id: key }).then((data: any) => {
                    resolve(data as Team);
                }).catch((e: any) => {
                    resolve(undefined!);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    public remove(key: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                schema.deleteOne({id: key }).then(() => {
                    resolve();
                }).catch((e: any) => {
                    reject(e);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    public set(key: string, value: Team): Promise<boolean> {
        return new Promise((resolve, _reject) => {
            new schema({
                id: key,
                gamemode: value.gamemode.toString().toUpperCase(),
                description: value.description,
                members: value.members,
                screenshots: value.screenshots,
                createdAt: value.createdAt,
                author: value.author
            }).save().then(() => {
                resolve(true);
            }).catch((e: any) => {
                console.log(e);
                resolve(false);
            })
        });
    }

    public getAll(): Promise<Team[]> {
        return new Promise((resolve, _reject) => {
            schema.find({}).then((data: any[]) => {
                resolve(data.map((d: any) => d as Team));
            }).catch((e: any) => {
                console.log(e);
                resolve([]);
            });
        });
    }

    public async connect(): Promise<void> {
        //console.log(Deno.env.get("MONGODB_URI")!);
        const connect = await mongoose.connect(Deno.env.get("MONGODB_URI")!)
        this.connection = connect.connection;
        console.log("Connected to MongoDB!");
        return Promise.resolve();
    }

    public close(): Promise<boolean> {
        return new Promise((resolve, _reject) => {
            this.connection?.close().then(() => {
                resolve(true);
                console.log("Closed MongoDB!");
            }).catch(e => {
                console.log(e);
                resolve(false);
            });
        })
    }

    public override save(): Promise<void> {
        return Promise.resolve();
    }

    public override isConnected(): boolean {
        return mongoose.connection.readyState === 1;
    }
}

export default MongoDB;