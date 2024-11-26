/**
 * All YouTube embeds on the website are static (only a thumbnail image with
 * a play button). This script adds an onClick event to each of these and loads
 * the official YouTube embed iframe when a user clicks on it.
 */
document.addEventListener('DOMContentLoaded', function () {
    const embeds = document.querySelectorAll(".youtube-embed");

    const addPrefetch = function(kind, url){
        const linkEl = document.createElement('link');
        linkEl.rel = kind;
        linkEl.href = url;
        document.head.append(linkEl);
    }

    if(embeds.length > 0){
        // Load resources that all embeds will need when activated
        addPrefetch("dns-prefetch", "https://www.youtube.com");
        addPrefetch("dns-prefetch", "https://fonts.gstatic.com");
    }
    
    for(const embed of embeds){
        const dataset = embed.dataset;
        if(!dataset) return;

        const videoId = dataset.videoid;
        if(!videoId) return;

        const embedUrl = 'https://www.youtube.com/embed/'
                            + videoId
                            + "?autoplay=1"
                            + "&playsinline=1"
                            + "&modestbranding=1"
                            + "&rel=0"

        // Prefetch the YouTube player in the background
        addPrefetch("prefetch", embedUrl);

        const createYouTubePlayer = function(){
            const iframe = document.createElement("iframe");
            iframe.src =  embedUrl

            const player = embed.parentNode.querySelector(".player");
            player.appendChild(iframe);

            embed.removeEventListener("click", createYouTubePlayer);
        }
        
        embed.addEventListener('click', createYouTubePlayer, false);
    }
});