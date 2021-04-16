/**
 * Loads Disqus comments when the user clicks on "Post a Comment"
 * No need to load their heavy library for every visitor (most don't comment anyway).
 * 
 * Based on W3Bits blog post:
 * https://w3bits.com/load-disqus-on-click/
 */
window.load_disqus = function () {
	// Prepare the trigger and target
	const disqus_trigger = document.getElementById('disqus_trigger');
	const disqus_target = document.getElementById('disqus_thread');
	const disqus_embed = document.createElement('script');
	const disqus_hook = (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]);

	// Load script asynchronously only when the trigger and target exist
	if (disqus_target && disqus_trigger) {
		disqus_embed.type = 'text/javascript';
		disqus_embed.async = true;
		disqus_embed.src = '//savjee.disqus.com/embed.js';
		disqus_hook.appendChild(disqus_embed);
		disqus_trigger.remove();
	} else {
		console.error("Could not load comments because target or trigger is not defined.");
	}
}