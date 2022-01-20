const {statSync} = require("fs");
const path = require("path");

const reg = /\<img.*src=["'](.*?)["']/mi;

/**
 * This paired shortcode takes HTML code for an image as input, and wraps
 * that into a <picture> element with a WebP version. This reduces bandwidth.
 * By using a shortcode, I can add custom styling to each <img> tag and still
 * benefit from the <picture> element.
 * 
 * It extracts the "src" attribute using a dumb regex. Sources starting with
 * "http" are ignored and the original HTML is returned without changes.
 * For local files, we check if the original and WebP versions exist on disk.
 * If not, an error is thrown to break the build process.
 * 
 * @param {string} originalHTML The HTML code between the paired shortcode tags.
 * @returns {string}
 */
module.exports = function (originalHTML) {
    const matches = reg.exec(originalHTML);

    if(matches === null){
        throw new Error("Could not find the source of the image: "
                         + originalHTML);
    }

    const imgSrc = matches[1];

    // Ignore remotely hosted images
    const isRemote = imgSrc.startsWith("http");
    const isYouTubeThumbnail = imgSrc.indexOf("i.ytimg.com") !== -1;

    if(isRemote && !isYouTubeThumbnail){
        return originalHTML;
    }

    // YouTube thumbnails also have WebP versions. If we detect a YouTube URL in
    // the form: i.ytimg.com/vi/VIDEO_ID/FORMAT.jpg, we extract the videoId and
    // format and add the correct WebP version.
    if(isYouTubeThumbnail){
        const reg = /i\.ytimg\.com\/vi\/(.*)\/(.*)\.jpg/mi;
        const matches = reg.exec(imgSrc);

        if(matches === null) return originalHTML;

        const videoId = matches[1];
        const thumbnailSize = matches[2];

        return `
            <picture>
                <source srcset="https://i.ytimg.com/vi_webp/${videoId}/${thumbnailSize}.webp" type="image/webp">
                ${originalHTML}
            </picture>
        `;
    }

    // If we end up here, it must be a local image.
    const imgPath = path.join(__dirname, '/../../site/', imgSrc);
    const imgSrcWebP = imgSrc.substring(0, imgSrc.length - 3) + "webp";
    const imgPathWebP = imgPath.substring(0, imgPath.length - 3) + "webp";
    
    // Check if the original image and webP version exist. StatSync will 
    // throw if they don't exist, which will break the build.
    statSync(imgPath, {throwIfNoEntry: true});
    statSync(imgPathWebP, {throwIfNoEntry: true});

    // If we get here, the file exists. Wrap the original HTML inside a 
    // <picture> element.
    return `
        <picture>
            <source srcset="${imgSrcWebP}" type="image/webp">
            ${originalHTML}
        </picture>
    `;
}