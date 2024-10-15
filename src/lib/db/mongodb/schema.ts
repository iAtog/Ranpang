import { Schema, model } from "npm:mongoose@^6.7";

const teamSchema = new Schema({
    id: String,
    gamemode: String,
    description: String,
    members: [],
    screenshots: [],
    createdAt: Date,
    author: String
}, { collection: "teams"});

teamSchema.path("id").required(true, "id cannot be blank.");
teamSchema.path("description").required(true, "description cannot be blank.");
teamSchema.path("gamemode").required(true, "gamemode cannot be blank.");
teamSchema.path("author").required(true, "author cannot be blank.");

export default model("Team", teamSchema);