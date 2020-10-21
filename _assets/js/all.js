//= require external-links
//= require lib/instantpage
//= require lib/disqusLoader
//= require analytics

// Lazy load Disqus comments
try{
	disqusLoader('#disqus_thread', { scriptUrl: 'https://savjee.disqus.com/embed.js' });
}catch(e){
	console.error(e);
}
