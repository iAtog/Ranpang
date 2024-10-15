import mongoose from "npm:mongoose";
import type { Connection, Mongoose } from "npm:mongoose";
import schema from './schema.ts';

import { Database } from "../mod.ts";
import { Team } from "../../team/mod.ts";

class MongoDB extends Database {

    public connection: Mongoose | undefined;
    
    constructor() {
        super();
    }

    public get(key: string): Promise<Team> {
        return new Promise((resolve, reject) => {
            try {
                schema.findOne({id: key }).then(data => {
                    resolve(data?.toJSON() as Team);
                }).catch((e) => {
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
                }).catch((e) => {
                    resolve();
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
            }).catch((e) => {
                console.log(e);
                resolve(false);
            })
        });
    }

    public getAll(): Promise<Team[]> {
        return new Promise((resolve, _reject) => {
            schema.find({}).then(data => {
                resolve(data.map(d => d.toJSON() as Team));
            }).catch(e => {
                console.log(e);
                resolve([]);
            });
        });
    }

    public async connect(): Promise<void> {
        this.connection = await mongoose.connect(Deno.env.get("MONGODB_URI")!);
        console.log("Connected to MongoDB!");
        return Promise.resolve();
    }

    public close(): Promise<boolean> {
        return new Promise((resolve, _reject) => {
            mongoose.connection.close().then(() => {
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
}

export default MongoDB;