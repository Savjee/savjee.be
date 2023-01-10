/**
 * Returns all items in a given collection that can be featured.
 * 
 * Non-featurable items should have "not_featureable: true" in their
 * front-matter. An item is considered featurable if that value is
 * undefined or set to false.
 *  
 * @param {*} collection Collection to filter
 * @returns Filtered collection
 */
module.exports = (collection) => {
    if (!Array.isArray(collection)) {
        throw new Error("getFeatureableVideos: first parameter is not an array");
    };

    return collection
        .filter(m => m.data.not_featureable === undefined || m.data.not_featureable === false);
};