import fg from "fast-glob";
import {readFile} from "fs/promises";

/**
 * Go over all Markdown file in the repository and run checks on them. File
 * contents is read once and then passed along to the check functions.
 */
(async () => {
    const files = await fg("src/**/*.md");
    const errors: boolean[] = [];

    for(const path of files){
        const contentBuffer = await readFile(path);
        const content = contentBuffer.toString();

        const fileErrors = await Promise.all([
            checkInternalLinks(path, content),
            checkVideoDuration(path, content),
        ]);

        errors.push(...fileErrors);
    }

    const anyError = errors.reduce((acc, curr) => acc || curr, false);
    if(anyError){
        process.exit(1);
    }

    console.log("All ok!");
})();


/**
 * Make sure that no links point towards "savjee.be" or "simplyexplained.com".
 * Instead, we should use "{% link %}" or "{% baseUrl %}". These helpers ensure
 * portability and additional safety because they check if the links actually
 * exist.
 */
export const regex_internal_md_link = /\[.*\]\(https?\:\/\/(savjee\.be|simplyexplained\.com).*\)/gi;
async function checkInternalLinks(path: string, markdownContents: string): Promise<boolean> {
    if(regex_internal_md_link.test(markdownContents)){
        console.error("Error: file contains hardcoded internal link ->", path);
        return true;
    }

    return false;
}

/**
 * Check if all courses and videos contains a "duration" attribute in the
 * frontmatter. If not, they would show up as "NaN" on the website.
 */
const regex_duration_frontmatter = /^duration:\s*\d+$/m;
async function checkVideoDuration(path: string, markdownContents: string): Promise<boolean> {
    if(!path.includes("/videos/") && !path.includes("/courses/")){
        return false;
    }

    if(regex_duration_frontmatter.test(markdownContents) === false){
        console.error("Error: video/course does not have a 'duration' attribute -> ", path);
        return true;
    }
    
    return false;
}
