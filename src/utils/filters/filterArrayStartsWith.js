/**
* 
*/
module.exports = (collection, desiredPrefix) => {
    console.log(collection.map(c => c.url));
    if (!Array.isArray(collection)) {
        throw new Error("filterArrayStartsWith: first parameter is not an array");
    };
    if (typeof desiredPrefix !== "string") {
        throw new Error("filterArrayStartsWith: second parameter should be a string");
    }
    return collection
            .filter(m => m.url.startsWith(desiredPrefix));
};