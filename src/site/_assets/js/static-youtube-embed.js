/**
 * All YouTube embeds on the website are static (only a thumbnail image with
 * a play button). This script adds an onClick event to each of these and loads
 * the official YouTube embed iframe when a user clicks on it.
 */
document.addEventListener('DOMContentLoaded', function () {
    const embeds = document.querySelectorAll(".youtube-embed");
    
    for(const embed of embeds){
        const dataset = embed.dataset;
        if(!dataset) return;

        const videoId = dataset.videoid;
        if(!videoId) return;

        embed.addEventListener('click', () => {
            const iframe = document.createElement("iframe");
            iframe.src = 'https://www.youtube.com/embed/'
                            + videoId
                            + "?autoplay=1"
                            + "&playsinline=1"
                            + "&modestbranding=1"
                            + "&rel=0" 

            const player = embed.parentNode.querySelector(".player");
            player.appendChild(iframe);
            embed.removeEventListener("click");
        });
    }
});