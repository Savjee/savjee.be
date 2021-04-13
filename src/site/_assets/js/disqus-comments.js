// Lazy load Disqus comments
try{
	disqusLoader('#disqus_thread', { scriptUrl: 'https://savjee.disqus.com/embed.js' });
}catch(e){
	console.error(e);
}
