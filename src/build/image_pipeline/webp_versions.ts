import { fileExists } from "../helpers/fileExists";
import sharp from "sharp";
import fg from "fast-glob";

/**
 * Finds all images that match the input glob pattern and convert them to WebP
 * without resizing. JPG images are compressed lossy at 70% quality. PNG images
 * are compressed with "nearLossless" option enabled to retain their sharpness.
 * 
 * Skips files that already have a WebP version (same filename, different ext).
 */
export async function generate_webp_versions(globPattern: string[]){
    const files = await fg(globPattern);
    for(const masterPath of files){
        const webpPath = masterPath.substring(0, masterPath.length-3) + "webp";

        if(await fileExists(webpPath) !== false){
            continue;
        }

        const originalExtension = masterPath.substring(masterPath.length-3);
        if(originalExtension !== "png" && originalExtension !== "jpg"){
            throw new Error("Unknown image format!");
        }

        let sharpOptions: sharp.WebpOptions = {};
        if(originalExtension === "png"){
            sharpOptions = {
                quality: 60,
                nearLossless: true, 
            }
        }else if(originalExtension === "jpg"){
            sharpOptions = {
                quality: 70, 
                lossless: false,
            }
        }

        console.log('Generating:', webpPath);
        await sharp(masterPath)
            .toFormat("webp", sharpOptions)
            .toFile(webpPath);
    }
}