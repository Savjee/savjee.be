/**
* 
*/
module.exports = (collection, desiredPrefix) => {
    if (!Array.isArray(collection)) {
        throw new Error("filterArrayStartsWith: first parameter is not an array");
    };
    if (typeof desiredPrefix !== "string") {
        throw new Error("filterArrayStartsWith: second parameter should be a string");
    }

    // Remove trailing slash
    if(desiredPrefix.endsWith("/")){
        desiredPrefix = desiredPrefix.slice(0, -1);
    }

    let parts = desiredPrefix.split("/");
    if(parts.length >= 3){
        parts.pop();
        desiredPrefix = parts.join("/");
        console.log("For", desiredPrefix, "new:", parts.join("/"));
    }


    return collection
            .filter(m => m.url.startsWith(desiredPrefix));
};