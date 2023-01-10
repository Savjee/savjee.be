/**
 * Define a post_url Liquid tag for cross referencing
 * 
 * Original creator: https://rusingh.com/articles/2020/04/24/implement-jekyll-post-url-tag-11ty-shortcode/
 * Adapted by me to work with filename instead of slug.
 * 
 * @param {*} collection 
 * @param {*} filename 
 * @returns 
 */
module.exports = function (collection, filename) {
  if (collection.length < 1) {
    throw "Collection appears to be empty";
  }
  if (!Array.isArray(collection)) {
    throw "Collection is an invalid type - it must be an array!";
  }
  if (typeof filename !== "string") {
    throw "Filename is an invalid type - it must be a string!";
  }
  const found = collection.find(p => p.template.inputPath.indexOf(filename) > -1);
  if (found === 0 || found === undefined) {
    // When nothing was found, throw an error to break the build.
    // Broken links should not be allowed!
    throw new Error(`File ${this.page.inputPath} wants to link to ${filename}, but it does not exist.`);
  } else {
    return found.url;
  }
}