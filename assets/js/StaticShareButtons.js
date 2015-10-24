var StaticShareButtons = {
    twitterButton: document.querySelector('.socialbutton.twitter'),
    facebookButton: document.querySelector('.socialbutton.facebook'),
    redditButton: document.querySelector('.socialbutton.reddit'),

    init: function () {
        this.injectScript('http://urls.api.twitter.com/1/urls/count.json?url=' +
            encodeURI(this.twitterButton.dataset.shareUrl) + '&callback=' + 'StaticShareButtons.processTwitter');

        this.injectScript('http://graph.facebook.com/?id=' +
            encodeURI(this.facebookButton.dataset.shareUrl) + '&callback=StaticShareButtons.processFacebook');

        this.injectScript('https://www.reddit.com/api/info.json?jsonp=StaticShareButtons.processReddit&url='
            + encodeURI(this.facebookButton.dataset.shareUrl))
    },

    injectScript: function (url) {
        var script = document.createElement('script');
        script.async = true;
        script.src = url;
        document.body.appendChild(script);
    },

    processTwitter: function (data) {
        if (data.count != undefined) {
            this.twitterButton.querySelector('.shares').innerHTML = data.count;
        }
    },

    processFacebook: function (data) {
        if (data.shares != undefined) {
            this.facebookButton.querySelector('.shares').innerHTML = data.shares;
        }
    },

    processReddit: function (data) {
        if(data.data != undefined){
            if (data.data.children.length > 0) {
                this.redditButton.querySelector('.shares').innerHTML = data.data.children[0].data.score;
            }
        }
    }
};

StaticShareButtons.init();