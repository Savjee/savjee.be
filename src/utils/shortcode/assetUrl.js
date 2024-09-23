const getAssetInfo = require("../getAssetInfo");
const fs = require("fs");

const copiedFiles = new Set();

/**
 * Returns the absolute URL to a given asset with the correct cache-busting
 * hash appended to the filename.
 * 
 * Usage in Liquid:
 *  {% assetUrl "path/to/assets/file" %}
 * 
 * @param {string} filePath 
 * @returns {object}
 */
module.exports = (filePath) => {
    if(typeof filePath !== "string"){
        throw new Error("Hash: first parameter should be of type string");
    }

    // 
    if(filePath.startsWith('node_modules') && !copiedFiles.has(filePath)){
        const assetInfo = getAssetInfo(filePath);
        fs.copyFileSync(filePath, "src/site/assets/js/" + assetInfo.originalFilename);

        copiedFiles.add(filePath);
        return assetInfo.publicPath;
    }else{
        const assetInfo = getAssetInfo("src/site/assets/" + filePath);
        return assetInfo.publicPath;
    }
};