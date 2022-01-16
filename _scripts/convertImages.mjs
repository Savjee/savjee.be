import { walk } from "@root/walk";
import path from "path";
import sharp from "sharp";
import { stat } from "fs/promises";

const perfData = ["type;original;webp"];

async function fileExists(pathName){
    const stats = await stat(pathName).catch((e) => {
        return false;
    });

    return stats;
}

/**
 * 
 * @param {*} err 
 * @param {*} pathname 
 * @param {Dirent} dirent 
 * @returns 
 */
const walkFunc = async (err, pathname, dirent) => {
    if (err) {
        throw err;
    }

    // Ignore files that start with underscore (those aren't published anyway)
    if (dirent.name.startsWith("_")) {
        return false;
    }

    // Name without extension
    const basename = path.basename(dirent.name, path.extname(pathname));
    const dirName = path.dirname(pathname);

    // Get size of the original image
    const origImage = await fileExists(pathname);

    // Create path to webp image and check if it already exists
    const webpOutputPath = path.join(dirName, '/', basename + ".webp");
    const webpExists = await fileExists(webpOutputPath);

    let perf = "";

    if(dirent.name.endsWith('.jpg') || dirent.name.endsWith('.png')){
        if(webpExists !== false){
            // console.log("Skip:", pathname);
            // return false;
        }
    }

    console.log("Process:", pathname);

    if(dirent.name.endsWith('.jpg')){
        const output = await sharp(pathname)
            .toFormat("webp", { quality: 70, lossless: false, })
            .toFile(webpOutputPath);
        
        perf = "jpg;" + origImage.size + ";" + output.size;
    }

    if(dirent.name.endsWith('.png')){
        const output = await sharp(pathname)
            .toFormat("webp", { quality: 60, nearLossless: true, })
            .toFile(webpOutputPath);

        perf = "png;" + origImage.size + ";" + output.size;
    }

    if(perf !== ""){
        perfData.push(perf);
    }
};

await walk("./src/site/uploads/", walkFunc);

console.log(perfData.join("\n"));
console.log("Done");