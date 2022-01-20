import sharp from "sharp";
import fg from "fast-glob";
import { fileExists } from "../helpers/fileExists";

const THUMBNAIL_SIZES = [
    { suffix: "twitter", width: 1120, height: 600 },
    { suffix: "facebook", width: 1200, height: 630 },
    { suffix: "timeline", width: 700, height: undefined },
];

async function generate_size(img: sharp.Sharp,
                            width: number, 
                            height: number|undefined, 
                            outputPath: string): Promise<void>{
    await img
        .clone()
        .resize({
            width: width,
            height: height,
            fit: "cover",
            position: "centre",
        })
        .jpeg({
            quality: 90,
            chromaSubsampling: '4:4:4',
        })
        .toFile(outputPath);
}

export async function generate_social_media_images(globPattern: string){

    // Go over all "thumb_master" files
    const files = await fg([globPattern]);

    for(const masterPath of files){
        // Load the master image in
        const img = sharp(masterPath);

        // Generate a specific image for each social platform
        for(const variant of THUMBNAIL_SIZES){

            const socialImgPath = masterPath.substring(0, masterPath.indexOf("_master.jpg"))
                                    + "_" + variant.suffix + ".jpg";

            if(await fileExists(socialImgPath) === false){
                console.log("Generating:", socialImgPath);
                generate_size(img, variant.width, variant.height, socialImgPath);
            }
        }
    }
}
