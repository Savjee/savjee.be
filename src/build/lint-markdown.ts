import fg from "fast-glob";
import {readFile} from "fs/promises";

const r = /\[.*\]\(https?\:\/\/(savjee\.be|simplyexplained\.com).*\)/gi;

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

// Test cases
/*
[my link](https://savjee.be/lkdjfmldsq)
[my link](http://savjee.be/lkdjfmldsq)
[my link](https://savjee.be)
[my link](https://savjee.be/lkdjfmldsq)
[my link](http://www.savjee.be.s3-website-eu-west-1.amazonaws.com))

(The full script is available [on GitHub](https://github.com/Savjee/savjee.be/blob/1a84362c4424ecd2ee7d368298ed30c218a2d66a/_deploy.sh))

*/ 