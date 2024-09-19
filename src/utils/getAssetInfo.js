const { createHash } = require('node:crypto');
const { readFileSync } = require('fs');
const path = require('path');

const cache = [];

/**
 * Returns the md5 hash for a given filepath. Used for cache busting only, so
 * the hash function is optimized for speed, not security.
 * 
 * @param {string} filePath 
 */
module.exports = function(filePath){
    if(cache[filePath]){
        return cache[filePath];
    }

    // Calculate hash for file
    const md5hash = createHash('md5');
    const data = readFileSync(filePath);
    const hash = md5hash.update(data).digest('hex');

    const parsedPath = path.parse(filePath);
    const newFileName = parsedPath.name + '-' + hash + parsedPath.ext;

    const output = {
        hash: hash,
        filename: newFileName,
        publicPath: parsedPath.dir.replace('src/site', '') + '/' + newFileName,
    };

    cache[filePath] = output;
    return output;
}