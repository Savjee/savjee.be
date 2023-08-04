import fg from "fast-glob";
import {readFile} from "fs/promises";

const r = /\[.*\]\(.*(savjee\.be|simplyexplained\.com).*\)/gi;

(async () => {
    const files = await fg("src/**/*.md");
    let errors = false;

    for(const path of files){
        const contentBuffer = await readFile(path);
        const content = contentBuffer.toString();

        if(r.test(content)){
            errors = true;
            console.error("Error: file contains hardcoded internal link ->", path);
        }
    }

    if(errors){
        process.exit(1);
    }
 })();

 