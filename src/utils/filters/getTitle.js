/**
 * 
 * @param {any} item 
 */
module.exports = (item) => {
    if(!item || !item.url){
        console.warn("Item has no URL. Bailing.");
        return null;
    }

    const url = item.url;
    if(url.startsWith("/courses/")){
        return item.data.courseName;
    }

    return item.data.title;
}