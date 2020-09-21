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

// Plausible test
!function(i,r){"use strict";var s=i.location,o=i.document,e=o.querySelector('[src*="'+r+'"]'),l=e&&e.getAttribute("data-domain"),t=!1;function n(e,t){if(/^localhost$|^127(?:\.[0-9]+){0,2}\.[0-9]+$|^(?:0*\:)*?:?0*1$/.test(s.hostname)||"file:"===s.protocol)return console.warn("Ignoring event on localhost");var n={};n.n=e,n.u=s.href,n.d=l,n.r=o.referrer||null,n.w=i.innerWidth;var a=new XMLHttpRequest;a.open("POST",r+"/api/event",!0),a.setRequestHeader("Content-Type","text/plain"),a.send(JSON.stringify(n)),a.onreadystatechange=function(){4==a.readyState&&t&&t.callback&&t.callback()}}function a(){n("pageview")}try{var c,p=i.history;p.pushState&&(c=p.pushState,p.pushState=function(){c.apply(this,arguments),a()},i.addEventListener("popstate",a));var u=i.plausible&&i.plausible.q||[];i.plausible=n;for(var d=0;d<u.length;d++)n.apply(this,u[d]);"prerender"===o.visibilityState?o.addEventListener("visibilitychange",function(){t||"visible"!==o.visibilityState||(t=!0,a())}):a()}catch(e){(new Image).src=r+"/api/error?message="+encodeURIComponent(e.message)}}(window,"https://plausible.io");