---
layout: post
title: Creating static social share buttons
description: "Create fast, lightweight social share buttons without external scripts. Improve website performance by avoiding heavy social network JavaScript dependencies."
quote:
thumbnail: true
upload_directory: /uploads/creating-static-social-buttons
---

Social networks are everywhere online. Share, like and tweet buttons are popping up on a lot of webpages these days.
The social buttons however have a big impact on the performance of a website. They load a ton of resources and slow down websites.

In this post I'll tell you why I hate these social buttons so much. I'll also walk you through the process of building the static share buttons that I use on my website.

<!--more-->

## Impact on performance
So why do I hate these social buttons so badly? Let me demonstrate my hate towards these buttons. I created two empty HTML pages and inserted the code for a Share button and Tweet button. The results speak for themselves:

<table class="pure-table pure-table-bordered pure-table-striped">
	<tr>
		<th rowspan="4" style='border-bottom: solid 1px #cbcbcb'>Facebook share button</th>
		<td>Load Time</td>
		<td>1.42 seconds</td>
	</tr>
	<tr>
		<td>Requests</td>
		<td>8</td>
	</tr>
	<tr>
		<td>Transfered</td>
		<td>147 KB</td>
	</tr>
	<tr>
    	<td>DOM Content Loaded</td>
    	<td>243 ms</td>
    </tr>
    <tr>
    	<th rowspan="4">Twitter Tweet button</th>
    	<td>Load Time</td>
    	<td>2.74 seconds</td>
    </tr>
    <tr>
    	<td>Requests</td>
    	<td>6</td>
    </tr>
    <tr>
    	<td>Transfered</td>
    	<td>54.1 KB</td>
    </tr>
    <tr>
       	<td>DOM Content Loaded</td>
       	<td>224 ms</td>
    </tr>
</table>

Simply adding a Facebook Share button makes your website load 1.42 seconds longer and 147KB bigger. Keep in mind that I disabled my cache to perform these tests. Most people probably have a cached version of these resources, so they load faster. These buttons also load asynchronously so they don't block page rendering (thank God!).

Still, they add a lot of bulk to your webpages. I compared these numbers with those for my website's homepage. I cried when I saw the results:

<table class='pure-table pure-table-bordered pure-table-striped'>
	<tr>
		<th rowspan="4" style='border-bottom: solid 1px #cbcbcb'>
			Savjee.be (with Google Analytics enabled)
		</th>
		<td>Load Time</td>
		<td>494ms</td>
	</tr>
	<tr>
		<td>Requests</td>
		<td>5</td>
	</tr>
	<tr>
		<td>Transfered</td>
		<td>21.7 KB</td>
	</tr>
	<tr>
		<td>DOM Content Loaded</td>
		<td>314ms</td>
	</tr>
	<tr>
    	<th rowspan="4">
    		Savjee.be (with Google Analytics disabled)
    	</th>
    	<td>Load Time</td>
    	<td>295ms</td>
    </tr>
    <tr>
    	<td>Requests</td>
    	<td>3</td>
    </tr>
    <tr>
    	<td>Transfered</td>
    	<td>9.7 KB</td>
    </tr>
    <tr>
    	<td>DOM Content Loaded</td>
    	<td>287ms</td>
    </tr>
</table>

(My website uses Gzip compression to make sure pages are as small as possible. [Read more here]({% link collections.posts, '2014-03-07-Jekyll-to-S3-deploy-script-with-gzip' %}).).

If I would integrate a share button on my homepage, I would make my page 6 times heavier (going from 21.7KB to 168.7KB). And that's only the Facebook button! Let's say I want to add Twitter and Google+ as well.

I'm sorry, but that's unacceptable to me!

Many might not care about loading an additional 57 or 147 KB. But I do! I hate loading more resources than actually necessary. These buttons might not have a big impact on modern computers with high-speed internet connections. The story is different when you load these social buttons on a smartphone with a much slower Egde or 3G connection. I want my website to be fast no matter where you live, what device you're using or how fast your internet connection is.


## Easy solution: static!
The simplest solution to this problem is using static share buttons. I've used a static Tweet button on my website for a couple of months now. The idea is easy: create a button and use the Twitter share URL like this:

{% highlight html %}
<a href='http://twitter.com/share?url=URL_TO_PAGE&text=TITLE_TO_SHARE&via=TWITTER_USERNAME' class='button'>Tweet a link to this page</a>
{% endhighlight %}

This share URL takes 3 parameters:

  * ``url``: The URL to tweet (this should be URL encoded!).
  * ``text``: The text that should be placed before the url.
  * ``via``: A Twitter username of the author. This will be appended to the tweet as 'via @Savjee'.

Facebook has a similar URL that allows you to share stories:
<pre>https://www.facebook.com/sharer/sharer.php?u=URL_TO_PAGE</pre>


## Making the buttons count!
I also want my static social buttons to show the amount of shares or tweets my page got. This involves some Javascript and JSONP magic. (And yes, I realize that this makes my buttons dynmic, not very static…)

[JSONP](http://en.wikipedia.org/wiki/JSONP) or “JSON with padding” is a Javascript technique that allows you to fetch data from a server on a different domain. Technically this isn't allowed by most browsers. JSONP takes advantage of the fact that browsers do not enforce the same-origin policy on ``<script>`` tags.

Both Facebook and Twitter have a URL that let's you check how many shares or tweets a given link has. Twitter's URL is not officially supported (read: might break in the future) but has been working for quite some time. You can use one of the following URLs:

<pre>http://graph.facebook.com/?id=http://www.google.com/&callback=myFunction
http://urls.api.twitter.com/1/urls/count.json?url=http://www.google.com/&callback=myFunction</pre>

Note the ``callback`` parameter. This tells the API to call a specific Javascript function on your page with the JSON results you're interested in. Here's the example output of both URLs:

{% highlight javascript %}
// Facebook's response
myFunction({
   "id": "http://www.google.com/",
   "shares": 10121803,
   "comments": 943
});

// Twitter's response
myFunction({
	count: 21992829,
	url: "http://www.google.com/"
})
{% endhighlight %}


Here is the piece of JSONP Javascript that I currently use to get the tweet and share count:

{% highlight javascript %}
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
{% endhighlight %}

I borrowed most of the code from [David Walsh's blog post](http://davidwalsh.name/twitter-facebook-jsonp). I just wrapped everything in one object.

Note that you can use a regular Ajax request for retrieving the share count from Facebook. This works because Facebook sets the Access-Control-Allow-Origin header to ``*``. Sadly you can't use the same technique for Twitter since they don't set that header. Shame!


## Designing the buttons
I started looking around for a design for my social buttons. I wanted a simple design that's flat and didn't include any images (retina-friendly!). I found a nice set of social buttons on [Dribble](https://dribbble.com/shots/1025655-Clean-Sharrre-Buttons-Freebie?list=tags&tag=css&offset=2) designed by [Maki Myers](http://www.makimyers.co.uk/).
I downloaded his code and refactored it so it doesn't use floats or relative positioning.

Here's the HTML code that I use on my website for the social buttons:

{% highlight html %}
<div class="share-button share-button-facebook" data-share-url="{{'http://www.savjee.be' | URLEncoding}}{{page.url | URLEncoding}}">
	<div class="box">
		<a href="https://www.facebook.com/sharer/sharer.php?u={{'http://www.savjee.be' | URLEncoding}}{{page.url | cgi_escape}}">
			<span class='share'>Share</span>
			<span class='count'>0</span>
		</a>
	</div>
</div>
{% endhighlight %}

There are some Liquid tags in this piece of HTML code that are being filled in by Jekyll. [I previously wrote a blog post on static blogging with Jekyll]({% link collections.posts, '2013-01-14-moving-from-Wordpress-to-Jekyll' %}). By default URLEncoding is not available in the Liquid templating engine but you can add it using [this](https://gist.github.com/jamesan/919275) simple filter.

My modified CSS code looks like this:

{% highlight css %}
.share-button-container{
	text-align:center;
	margin: 20px 0;
	padding: 10px 0;
	border-top: solid 1px #e4e4e4;
	border-bottom: solid 1px #e4e4e4;
}

.share-button-container p{
	margin:0px 0 10px 0;
}

.share-button {
	margin-left: 20px;
}

.share-button a{
	text-decoration:none;
}

.share-button, .share-button .count{
	display:inline-block;
}

.share-button .count, .share-button .share {
	font-family:"Helvetica Neue";
	font-weight:700;
	text-decoration:none;
	text-align:center;
}

.share-button .count {
	background-color:#F1F3F6;
	color:#333;
	font-size:12px;
	line-height:25px;
	margin-left:4px;
	text-transform:uppercase;
	min-width:40px;
}

.share-button .share {
	-webkit-border-radius:2px;
	-moz-border-radius:2px;
	border-radius:2px;
	color:#FFF;
	display:inline;
	font-size:13px;
	width:40px;
	padding:4px 8px;
}

.share-button-twitter .share {
	background-color:#00ABF0;
}

.share-button-facebook .share {
	background-color:#3b5998;
}

.share-button-googleplus .share {
	background-color:#F53424;
}

.share-button-twitter .share:active,.share-button-facebook .share:active,.share-button-googleplus .share:active {
	background-color:#353535;
}
{% endhighlight %}

The buttons are rendered correctly on every type of device. No need for responsive CSS. However, the only thing I did for my website is increase the size of the buttons for mobile devices. This makes them easier to tap:

{% highlight css %}
/* Much more easy to tap on a big button! */
@media (max-width: 925px) {
	.share-button .share{
		font-size:15px;
		padding: 8px 16px;
	}

	.share-button .count{
		font-size:14px;
		line-height: 32px;
	}
}
{% endhighlight %}

## Result & Limitations
Here's a screenshot of the finished product:
![Screenshot of the static buttons](/uploads/creating-static-social-buttons/screenshot_buttons.png)

You can see them in action at the bottom of each blog post on my website.

You can have static share buttons for a number of social networks. Want Google+, LinkedIn, Pintrest, ...?
Then check out [this gist](https://gist.github.com/jonathanmoore/2640302) for additional information on other social networks.

Sadly, you can't have a static Like button. This requires the Facebook SDK.


## Source
The source code is available on GitHub. Check it out: [https://github.com/Savjee/static-social-buttons](https://github.com/Savjee/static-social-buttons).