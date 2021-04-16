module.exports = (collection, inputTags, id) => {
    if(!Array.isArray(inputTags)){
        console.warn("getRelated: Tags is not an array");
        return [];
    }

    if (!Array.isArray(collection)) {
        throw new Error("getRelated: first parameter is not an array");
    }

    if(!id || typeof id !== "string"){
        throw new Error("getRelated: id not provided or not a string");
    }

    const matches = [];

    // Run over all items in the collection
    for(const item of collection){
        if(!Array.isArray(item.data.tags)) continue;

        // Ignore the input page itself
        if(item.inputPath === id) continue;

        // Check which tags of the current page is also present
        let matchedTagCount = 0;
        for(const tag of inputTags){
            if(item.data.tags.indexOf(tag) > -1){
                matchedTagCount++;
            }
        }

        // Now set them in the map
        if(matchedTagCount > 0){
            matches.push({
                inputPath: item.inputPath,
                count: matchedTagCount,
            });
        }
    }

    // Now sort the collection based on the matches
    matches.sort((a,b) => b.count - a.count);

    // Return the full page object for each of them
    return matches.map((match) => {
        return collection.find(e => e.inputPath === match.inputPath)
    });
};