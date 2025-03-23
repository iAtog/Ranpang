import { Client, CommandInteraction, AutocompleteInteraction, AttachmentBuilder, Interaction } from "npm:discord.js";
import { TeamGameMode, TeamsHandler, Team, TeamType, type Screenshot } from "../../lib/team/mod.ts";
import EZ_Host from "../../lib/e-z_host/mod.ts";
import { Database } from "../../lib/db/mod.ts";

import { createCanvas, Canvas, Image, ImageData, CanvasRenderingContext2D } from "npm:canvas";
import * as svg2img from "npm:svg2img";
import { Buffer } from "node:buffer";
import { Resvg } from "npm:@resvg/resvg-js";
import sharp from "npm:sharp";
import puppeteer from "npm:puppeteer";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

//import canvg from "npm:canvg";

class RaidUtil {

    public async generateRaidImage(client: Client, interaction: CommandInteraction) {
        fetch('https://www.gtales.top/api/raids/history').then(res => res.json()).then(data => {
            const season = data.seasons[0] as Season;
            const bosses = season.bosses;

            

        });
        /*
        const canvas = createCanvas(2048, 1024);
        const ctx = canvas.getContext('2d');

        // const svgContent = fs.readFileSync('image.svg', 'utf-8');
        // canvg(ctx, svgContent);

        const buffer = canvas.toBuffer('image/png');
*/
    }

    private heroAsset(hero: string) {
        return "https://www.gtales.top/assets/heroes/" + hero + ".webp"
    }

    public async generateTeamImage(member1: string, member2: string, member3: string, member4: string) {
        

        //const buffer = canvas.toBuffer('image/png');

    }

    public async createImage(image: ImageData) {
        const canvas = await createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        ctx.putImageData(image, 0, 0);
        return canvas;
    }

    public async fetchImageAsBase64Xml(url: string): Promise<string> {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        const formattedBase64 = base64.match(/.{1,76}/g)!.join('&#10;');
        const mimeType = response.headers.get("content-type") || "image/png";
        return `data:${mimeType};base64,${formattedBase64}&#10;`;
    }
    public async fetchImageAsBase64(url: string): Promise<string> {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64'); // Cambio clave aquí
        const mimeType = response.headers.get("content-type") || "image/png";
        return `data:${mimeType};base64,${base64}`;
    }

    public async convertSvgToPng(svgString: string): Promise<Buffer> {
        const svgBuffer = new TextEncoder().encode(svgString);

        const pngBuffer = await sharp(svgBuffer)
            .png()
            .toBuffer();

        return pngBuffer;
      }

    public generateRandomId(): string {
        const abc = "abcdefghijkmnopqrstuvwxyz0123456789";
        let id = "";
        for (let i = 0; i < 8; i++) {
            id += abc[Math.floor(Math.random() * abc.length)];
        }

        return id;
    }

    public async svgToPng(svgString: string): Promise<Buffer> {
        // 1. Crear data URL del SVG
        const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
        
        // 2. Cargar la imagen desde el data URL
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Error cargando SVG"));
          img.src = svgDataUrl;
        });
      
        // 3. Crear canvas con dimensiones del SVG
        const canvas = new Canvas(img.width, img.height);
        const ctx = canvas.getContext("2d");
        
        // 4. Renderizar la imagen en el canvas
        ctx.drawImage(img, 0, 0, img.width, img.height);
      
        // 5. Exportar como PNG
        return canvas.toBuffer("image/png");
      }

    public async buildTeamSvg(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        const images = [
            this.heroAsset("rue"),
            this.heroAsset("rue"),
            this.heroAsset("rue"),
            this.heroAsset("rue"),
        ];

        const imageBase64List = await Promise.all(
            images.map(url => this.fetchImageAsBase64(url))
        );

        const svg = await Deno.readFileSync("./local/image/teamtemplate.svg");
        let svgString = new TextDecoder().decode(svg);

        for (let i = 0; i < images.length; i++) {
            svgString = svgString.replace(`%HERO_IMAGE_${i + 1}%`, imageBase64List[i]);
        }
        /*
        const resvg = new Resvg(svgString, {});
        
        const pngData = resvg.render();
        const pngBuffer = pngData.asPng();*/

        //const pngBuffer = await sharp(Buffer.from(svgString)).png().toBuffer();
        Deno.writeTextFileSync("image.svg", svgString);
        
        //let a = `data:image/svg+xml;charset=utf8,${svgString}`;
        //Deno.writeTextFileSync("imagennnnnn.png", a);
        const pngBuffer = await this.convertSvgToPng(svgString);
        // pngBuffer = await this.svgToPng(svgString);
        Deno.writeFileSync("image.png", pngBuffer);
        await sharp(Buffer.from(svgString)).png().toFile("image.png");
        const attachment = new AttachmentBuilder(pngBuffer, {
            name: "imagen.png",
        });

        await interaction.followUp({
            files: [attachment],
            ephemeral: false
        });
    }

}

interface Season {
    season: string;
    from: string;
    to: string;
    bosses: Boss[];
}

interface Boss {
    boss: string;
    element: string;
}

export {
    RaidUtil
}