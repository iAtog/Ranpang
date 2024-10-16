import "jsr:@std/dotenv/load"

import mongoose from "npm:mongoose";
import schema from '../src/lib/db/mongodb/schema.ts';

import { MongoClient } from "npm:mongodb";


const client = new MongoClient(Deno.env.get("MONGODB_URI")!);


await client.connect();

const dbName = "gt";
const collectionName = "teams";

const db = client.db(dbName);
const collection = db.collection(collectionName);

collection.insertOne({
    id: "testeo",
    gamemode: "COLOSSEUM",
    description: "testing",
    members: [
        {key: "craig", name: "Craig"},
        {key: "yuna", name: "Yuna"},
        {key: "sia", name: "Sia"},
        {key: "miya", name: "Miya"},
        
    ],
    author: "Richard",
    createdAt: new Date(),
    screenshots: [{url: "test", name: "test"}]
}).then((result: any) => {
    console.log("Inserted team!");
}).catch(e => {
    console.log(e);
});



/*
await mongoose.connect(Deno.env.get("MONGODB_URI")?.toString()!)

console.log("Connected to MongoDB!");

const team = new schema({
    id: "test",
    gamemode: "COLOSSEUM",
    description: "testing",
    members: [
        {key: "sia", name: "Sia"},
        {key: "sia", name: "Sia"},
        {key: "sia", name: "Sia"}
    ],
    author: "Richard",
    createdAt: new Date(),
    screenshots: [{url: "test", name: "test"}]
});

team.save().then(() => {
    console.log("Team saved!");
    mongoose.connection.close();
}).catch(async(e: any) => {
    console.log(e);
    await mongoose.connection.close();
});
*/