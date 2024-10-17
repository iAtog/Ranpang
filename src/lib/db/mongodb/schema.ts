import mongoose from "npm:mongoose";

const teamSchema = new mongoose.Schema({
    id: String,
    type: String,
    gamemode: String,
    description: String,
    members: [],
    screenshots: [],
    createdAt: Date
}, { collection: "teams"});

teamSchema.path("id").required(true, "id cannot be blank.");
teamSchema.path("type").required(true, "type cannot be blank.");
teamSchema.path("description").required(true, "description cannot be blank.");
teamSchema.path("gamemode").required(true, "gamemode cannot be blank.");

export default mongoose.model("Team", teamSchema);