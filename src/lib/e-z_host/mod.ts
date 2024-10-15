import fs from "node:fs";
import { createTeamId } from "../team/mod.ts";
import axios from "npm:axios";

// deno-lint-ignore-file no-explicit-any no-explicit-any
class EZ_Host {
    
    public async upload(filePath: string): Promise<EZHostResponse> {
        const fileName = filePath.split("/").pop() || "file";
        const fileContent = await Deno.readFile(filePath);

        const formData = new FormData();
        formData.append("file", new Blob([fileContent]), fileName);

        const response = await fetch("https://api.e-z.host/files", {
            method: 'POST',
            headers: {
                'key': Deno.env.get('EZ_HOST_KEY'), 
            },
            body: formData,
        });

        if (response.ok) {
            const responseText = await response.text();
            const data = JSON.parse(responseText) as EZHostResponse;
            return data;
        } else {
            console.error("File upload failed:", response.status, response.statusText);
            return {
                success: false,
                message: "Error uploading file",
                imageUrl: "",
                rawUrl: "",
                deletionUrl: ""
            }
        }
    }

    public async createUrl(url: string): Promise<void> {
        const teamId = createTeamId();
        Promise.resolve();
    }

    public async download(url: string, extension: string, id: string = createTeamId()): Promise<string> {
        const dest = `${Deno.cwd()}/local/${id}.${extension}`;
        const writer = fs.createWriteStream(dest);
        const res = await axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        });

        return new Promise((resolve, reject) => {
            res.data.pipe(writer);
            writer.on('error', (err) => {
                writer.close();
                reject(err);
            });
            writer.on('finish', () => {
                resolve(dest);
                writer.close();
            });
        });
    }

    public async delete(path: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if(!fs.existsSync(path)) {
                reject(new Error("File not found"));
                return;
            }
            fs.unlinkSync(path);
            resolve();
        });
    }
}

interface EZHostResponse {
    success: boolean;
    message: string;
    imageUrl: string;
    rawUrl: string;
    deletionUrl: string;
}

export default EZ_Host;

export type {
    EZHostResponse
}