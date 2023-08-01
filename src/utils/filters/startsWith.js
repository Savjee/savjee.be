/**
 * Returns the index of a give page inside a given collection.
 * 
 * Usage in Liquid:
 *  {{ collections.videos | indexOf: page }}
 * 
 * @param {*} collection
 * @param {*} page 
 * @returns {number}
 */
module.exports = (input, needle) => {
    if (typeof input !== "string" || typeof needle !== "string") {
        throw new Error("Input parameters need to be strings");
    };

    return input.startsWith(needle);
};