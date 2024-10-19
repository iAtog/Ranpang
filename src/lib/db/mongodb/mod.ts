// deno-lint-ignore-file no-explicit-any
import mongoose from "npm:mongoose";
import schema from './schema.ts';

import { Database } from "../mod.ts";
import { Team } from "../../team/mod.ts";

class MongoDB extends Database {
    
    constructor() {
        super();
    }

    public get(key: string): Promise<Team> {
        return new Promise((resolve, reject) => {
            try {
                schema.findOne({id: key }).then((data: any) => {
                    resolve(data as Team);
                }).catch((_e: any) => {
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
                type: value.type,
                gamemode: value.gamemode.toString().toUpperCase(),
                description: value.description,
                members: value.members,
                screenshots: value.screenshots,
                createdAt: value.createdAt
            }).save().then(() => {
                resolve(true);
            }).catch((e: any) => {
                console.log(e);
                resolve(false);
            })
        });
    }

    public override update(key: string, value: Team): Promise<boolean> {
        return new Promise((resolve, _reject) => {
            schema.updateOne({id: key }, {$set: {
                type: value.type,
                gamemode: value.gamemode.toString().toUpperCase(),
                description: value.description,
                members: value.members,
                screenshots: value.screenshots,
                createdAt: value.createdAt
            }}).then(() => {
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
        await mongoose.connect(Deno.env.get("MONGODB_URI")!)
        //this.connection = connect.connection;
        console.log("Connected to MongoDB!");
        return Promise.resolve();
    }

    public close(): Promise<boolean> {
        return new Promise((resolve, _reject) => {
            mongoose.connection.close().then(() => {
                resolve(true);
                console.log("Closed MongoDB!");
            }).catch((e:any) => {
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

    public override databaseName(): string {
        return "mongodb";
    }
}

export default MongoDB;