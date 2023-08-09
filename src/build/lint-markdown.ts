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
            checkObsidianLinks(path, content),
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

/**
 * Make sure that Markdown files don't contain any internal Obsidian links.
 * This would be the case when transfering my content from Obsidian to here.
 */
const regex_obsidian_link = /\[\[([^\[\]]+)\]\]/gmi;
const internal_link_whitelist = [
    "src/site/videos/mrna-vaccines-questions-and-misconceptions.md",
    "src/site/posts/2014/2014-03-07-Jekyll-to-S3-deploy-script-with-gzip.md",
    "src/site/posts/2020/2020-09-17-tuya-ir-hub-daikin-ac-home-assistant-esphome.md",
    "src/site/posts/2021/2021-04-10-good-home-automation-should-be-boring.md",
    "src/site/posts/2021/2021-04-18-migrating-this-blog-from-jekyll-to-eleventy.md",
    "src/site/posts/2021/2021-07-06-filtering-spam-on-youtube-with-tensorflow-and-ai.md",
    "src/site/posts/2022/2022-09-10-serverless-anagram-solver-with-cloudflare-r2-and-pages.md",
]
async function checkObsidianLinks(path: string, markdownContents: string): Promise<boolean> {
    // Some files contain double brackets in code blocks, and should not be
    // marked as wrong. Here, we implement a simple whitelist for those files.
    if(internal_link_whitelist.indexOf(path) !== -1){
        return false;
    }

    if(regex_obsidian_link.test(markdownContents)){
        console.error("Error: file contains an internal Obsidian link", path);
        return true;
    }

    return false;
}
