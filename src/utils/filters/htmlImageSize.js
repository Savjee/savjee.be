const sizeOf = require('image-size');

/**
 * Takes a path to an image, fetches its dimensions and returns
 * the "width" and "height" attributes in HTML format. Used
 * primarily to reduce layout shifts while lazy loading images.
 * 
 * Note: There's no error handling on purpose. I want the build to 
 * fail when an image path does not exist.
 * 
 * Usage in liquid:
 *    <img src="{{ url }}" {{ url | htmlImageSize }} />
 * 
 * Will output:
 *    <img src="/logo.png" width="231" height="123" />
 */
module.exports = (imagePath) => {
    const basePath = __dirname + "/../../site/";
    const dimensions = sizeOf(basePath + imagePath);

    return `width="${dimensions.width}" height="${dimensions.height}"`;
}