import mongoose from "npm:mongoose";

const teamSchema = new mongoose.Schema({
    id: String,
    gamemode: String,
    description: String,
    members: [],
    screenshots: [],
    createdAt: Date
}, { collection: "teams"});

teamSchema.path("id").required(true, "id cannot be blank.");
teamSchema.path("description").required(true, "description cannot be blank.");
teamSchema.path("gamemode").required(true, "gamemode cannot be blank.");
teamSchema.path("author").required(true, "author cannot be blank.");

export default mongoose.model("Team", teamSchema);