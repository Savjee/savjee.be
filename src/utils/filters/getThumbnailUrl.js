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
        return url + "resources/thumb.jpg";
    }

    if(url.startsWith("/blog/")){
        if(!item.data.upload_directory){
            return null;
        }
        return `${item.data.upload_directory}/thumb_timeline.jpg`
                    .replace("//", "/");
    }
    
    if(url.startsWith("/videos/")){
        return `https://i.ytimg.com/vi/${item.data.videoId}/maxresdefault.jpg`;
    }

    console.warn("Could not match URL to a known content type:", item.url);
    return null;
}