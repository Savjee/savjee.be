const { createHash } = require('node:crypto');
const { readFileSync } = require('fs');
const path = require('path');

// To avoid hashing files multiple times, we cache hashes based on filepath
const cache = [];

/**
 * Given a filepath to a CSS or JS file, this function will return information
 * about that file, including the md5 hash, the filename with hash, and the 
 * public path to the file (absolute path).
 * 
 * There is intentionally no error handling in this function. If information is
 * requested on a file that doesn't exist, it will throw an error which should
 * break the build process.
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