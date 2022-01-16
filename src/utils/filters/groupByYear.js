/**
 * Takes the given collection and groups the content by year.
 * Easy to iterate in templates. Not super efficient as it performs
 * two lookups in the resulting array for each post.
 * 
 * Return format:
 *  [
 *    { 
 *      year: 2021,
 *      posts: [...],
 *    },
 *    ...
 *  ]
 * 
 * @param {Array} collection 
 * @returns {Array}
 */
module.exports = (collection) => {
    if (!Array.isArray(collection)) {
        throw new Error("groupBy: first parameter is not an array");
    };

    const output = [];

    const findYear = (year) => {
        return output.find(obj => obj.year === year);
    };

    for(const p of collection){
        const year = p.date.getFullYear();
        const yearObj = findYear(year);

        if(!yearObj){
            output.push({
                year: year,
                posts: [],
            });
        }
        
        findYear(year).posts.push(p);
    }

    return output;
};