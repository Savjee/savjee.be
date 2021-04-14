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
module.exports = (collection, page) => {
    if (!Array.isArray(collection)) {
        throw new Error("indexOf: first parameter is not an array");
    };

    if (typeof page !== "object") {
        throw new Error("indexOf: second parameter should be an object");
    }

    return collection.indexOf(
        collection.find(p => p.inputPath === page.inputPath)
    );
};