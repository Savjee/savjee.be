var StaticShareButtons = {
	twitterButton: document.querySelector('.share-button-twitter'),
	facebookButton: document.querySelector('.share-button-facebook'),

	init: function(){
		this.injectScript('http://urls.api.twitter.com/1/urls/count.json?url=' + 
			escape(this.twitterButton.dataset.shareUrl) + '&callback=' + 'StaticShareButtons.processTwitter');

		this.injectScript('http://graph.facebook.com/?id='+ 
			escape(this.facebookButton.dataset.shareUrl) +'&callback=StaticShareButtons.processFacebook');
	},

	injectScript: function(url){
		var script = document.createElement('script');
		script.async = true;
		script.src = url;
		document.body.appendChild(script);
	},

	processTwitter: function(data){
		if(data.count != undefined){
			this.twitterButton.querySelector('.count').innerHTML = data.count;
		}
	},

	processFacebook: function(data){
		if(data.shares != undefined){
			this.facebookButton.querySelector('.count').innerHTML = data.shares;
		}
	}
}
	
StaticShareButtons.init();