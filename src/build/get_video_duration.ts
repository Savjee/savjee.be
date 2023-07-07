import fg from "fast-glob";
import { open } from 'node:fs/promises';
import {exec} from "node:child_process";
import util from "node:util";

const execPromise = util.promisify(exec);
const regexVideoId = /videoId:\s?(.*)$/gmi;

(async () => {
    const video_files = await fg("src/site/videos/**/*.md");

    for(const vid of video_files){
        const handle = await open(vid, "r");
        const contents = (await handle.readFile()).toString();
        const matches = regexVideoId.exec(contents);
        handle.close();

        if(!matches){
            console.log("no matches!", matches, vid);
            continue;
        }

        // continue;
        // const videoId = matches[1];
        // const {stdout} = await execPromise(`yt-dlp --get-duration "https://youtube.com/watch?v=${videoId}"`);

        // const minutes = parseInt(stdout.split(":")[0]);
        // const seconds = parseInt(stdout.split(":")[1]);

        // console.log(videoId, stdout, minutes, seconds, minutes*60+seconds);
        // console.log("-");
    }
})();