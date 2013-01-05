function trackOutboundLink(link) {
	console.log("tracked link: " + link);

	try{
		_gaq.push(['_trackEvent', 'outbound-link', link]);
		setTimeout('document.location = "' + link + '"', 100);
	}catch(e){}
}

window.onload = function(){
	var posts = document.getElementsByClassName("post-content");

	for(i=0; i<=posts.length-1; i++){
		var links = posts[i].getElementsByTagName('a');

		for(ii=0; ii<=links.length-1;ii++){
			links[ii].onclick = function(){
				trackOutboundLink(this.href);
				return false;
			}
		}

	}
}