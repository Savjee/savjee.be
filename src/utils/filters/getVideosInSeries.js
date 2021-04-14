/**
* Liquid filter: getVideosInSeries 
* 
* Usage in liquid:
*    {% assign vidsInSerie = collections.videos | getVideosInSeries: "Simply explained" %}
* 
* Takes the given video collection (parameter 1, before the pipe) 
* and returns only the videos in a given series (param 2, string).
*/
module.exports = (collection, serieName) => {
    if (!Array.isArray(collection)) {
        throw new Error("getVideosInSeries: first parameter is not an array");
    };
    if (typeof serieName !== "string") {
        throw new Error("getVideosInSeries: second parameter should be a string");
    }
    return collection
            .filter(m => m.data.series === serieName)
            .sort((a, b) => { return a.data.order - b.data.order });
};