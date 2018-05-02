---
layout: post
title: Implement Content Security Policy with AWS S3 and CloudFront
quote:
---

About a week ago I found out that Troy Hunt had published a new course about modern web security. I decided to check out the introduction video and that made me realize that I don't have a Content Security Policy (CSP) for my website. In fact, I was missing a lot of security headers... Time to get up to speed!

<!--more-->

The architecture of my website is pretty simple and [I've talked about it before]({% post_url 2013-01-14-moving-from-Wordpress-to-Jekyll %}). It's a static website that is hosted on AWS S3 and uses CloudFront as a CDN to speed things up. While this is easy to set up, there are some limitations to it when it comes to setting custom HTTP headers.

## Setting custom headers
Before I can set custom HTTP headers, I need to learn how! With my current setup that's actually not trivial. CloudFront will take any headers that the origin has set and will forward them to the client. However, I can't set custom headers on my files in S3...

Then I found out that you can use a Lambda@Edge function to inject security headers through CloudFront. Amazon even wrote  [a guide](https://aws.amazon.com/blogs/networking-and-content-delivery/adding-http-security-headers-using-lambdaedge-and-amazon-cloudfront/) on how to do this. So I followed that and ended up creating a new Lambda function in the  `N. Virginia` region (it has to be this region for Lambda@Edge to work).

There are some other requirements as well: the function has to be written in node.js, can only use 128mb of memory and can only run for 3 seconds before they timeout. More than enough to inject some headers!

This is the skeleton for my function:

{% highlight js %}
exports.handler = (event, context, callback) => {
    const response = event.Records[0].cf.response;
    const headers = response.headers || [];

    // --- Set security headers here ---
    // I'll be detailing them in the rest of the post.

    callback(null, response);
};
{% endhighlight %}

Our Lambda function will be executed by CloudFront when someone visits my website. If that happens, our function receives the `event` object from CloudFront which contains all the information about the visitor and where he wants to go. In this object we also find the `headers` that are set by the origin.

So all we do here is extract the `headers` from the `event` object, add some custom headers and then send everything back to CloudFront so it can send it to the user.

## Deploying the function
Integrating your Lambda function with CloudFront is very simple. Start by clicking on CloudFront in the “Add triggers” section:

![](/uploads/csp-s3-cloudfront/cloudfront-trigger.png)

Then choose your CloudFront distribution from the list, set the CloudFront event for which your Lambda should listen and enable the trigger.

![](/uploads/csp-s3-cloudfront/cloudfront-cache.png)

Interesting to note: pick the `Origin response` event if you want to minimize the requests that hit your Lambda function. Why? Well CloudFront will then cache the result of your Lambda function whereas with `Viewer response` it will execute your Lambda for *every* request and that could become expensive if you have a busy website.

Alright, now we know how to create and deploy the Lambda@Edge function, let’s now add some headers…


## Content Security Policy
Let's start with CSP or Content Security Policy. I had heard of it but never really looked into it. So I started with pulling up [the MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) for it and this is what they had to say:

> A primary goal of CSP is to mitigate and report XSS attacks. XSS attacks exploit the browser's trust of the content received from the server.
>
> (...)
>
> A CSP compatible browser will then only execute scripts loaded in source files received from those whitelisted domains, ignoring all other scripts (including inline scripts and event-handling HTML attributes).

So browsers will by default trust anything a server sends and load additional resources if required. This could allow people to inject their own Javascript code into your website (think about malware or ISP's that add banners). With a CSP you can define where the browser can load these resources from (and block everything else).

Adding a security policy is really simple. All you have to do is configure your web server to return the `Content-Security-Policy` HTTP header.

How you configure the policy is a different story. Websites nowadays are very complex and are loading stuff from all kinds of places (think about Disqus comments, social media buttons, advertisements, analytics, ...). All these sources have to be explicitly whitelisted or they will break once you implement a CSP.

So here is the CSP that I wrote for my website:

    default-src 'self';

    connect-src links.services.disqus.com www.google-analytics.com googleads.g.doubleclick.net static.doubleclick.net savjee.report-uri.com c.disquscdn.com disqus.com;

    font-src 'self' fonts.gstatic.com;

    frame-src disqus.com c.disquscdn.com www.google.com www.youtube.com accounts.google.com;

    img-src 'self' c.disquscdn.com referrer.disqus.com https://*.disquscdn.com www.google-analytics.com www.gstatic.com ssl.gstatic.com i.ytimg.com i.imgur.com images.gr-assets.com s.gr-assets.com data:;

    script-src 'self' c.disquscdn.com disqus.com savjee.disqus.com https://*.disquscdn.com www.google.com www.google-analytics.com www.gstatic.com apis.google.com goodreads.com www.goodreads.com 'sha256-TBqllJlBMexSGRieFFU5KWd8G9KEcSOtCu0N0HD2OLQ=' 'sha256-A69xDpNgWP5qzy8GbnRIm7q5W/AxoQCnLQMCF7pPl6k=' 'sha256-oGgipIj5gYY2i5nrFigTB2+WfNjyfSVxqFfOl9tM5zY=';

    style-src 'self' 'unsafe-inline' c.disquscdn.com https://*.disquscdn.com fonts.googleapis.com;

    object-src 'none';

    upgrade-insecure-requests;
    report-uri https://savjee.report-uri.com/r/d/csp/enforce;

Notice that a CSP has many different _directives_ that control what is allowed to load on your website. Here is a quick summary (more details are available [on MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)):

* `default-src` is a fallback. When the browser loads a resource that isn't allowed by any other directive it will use this as a fallback. It's best to keep this one really simple. Mine is set to `self` so that by default I allow loading any resources that are hosted on my domain.
* `connect-src` restricts what URLs can be loaded by scripts (this impacts any Ajax requests that you might run)
* `font-src` is exactly what it sounds like. If you're using services like Google Fonts or Adobe Typekit, make sure to add those here!
* `frame-src` restricts what iframe's you can put on your website. I whitelist Disqus and YouTube because I want comments to appear below my post and I want to embed videos. The `object-src` directive is quite similar (think embedding flash objects or PDF's, which is really old-school)
* `img-src` is also pretty straightforward: it limits where you can load images from. This is a tricky one to get correct because it's likely that you aren't hosting all images on your own website and certain scripts that you use might inject images when needed.
* `script-src` again pretty straightforward although there is a caveat: when you enable CSP you can't use inline scripts anymore unless you list their hash in here (I do this for Google Analytics and a few scripts I wrote myself). I'll come back to this later!
* `style-src` is to limit where you can load CSS files from. Same story as with the `script-src` directive: you cannot use inline styles anymore unless you define them here. I've set mine to allow it anyway with `unsafe-inline` but I intend on removing that when I publish a new version of my site.
* `upgrade-insecure-requests` this one tells the browser that they have to load all resources on your website over a secure HTTPS connection. If we try to load something via HTTP, the browser will automatically upgrade the request to a secure HTTPS connection.
* And finally, we have `report-uri` which tells the browser to log violations of your policy to a service of your choosing. This is quite important, more on that later!

After writing your CSP, add them to your HTTP headers like so:

{% highlight js %}
headers['content-security-policy'] = [{
    key:   'Content-Security-Policy',
    value: "default-src 'self'; connect-src links.services.disqus.com www.google-analytics.com googleads.g.doubleclick.net static.doubleclick.net savjee.report-uri.com c.disquscdn.com disqus.com; font-src 'self' fonts.gstatic.com; frame-src disqus.com c.disquscdn.com www.google.com www.youtube.com accounts.google.com; img-src 'self' c.disquscdn.com referrer.disqus.com www.google-analytics.com www.gstatic.com ssl.gstatic.com i.ytimg.com i.imgur.com images.gr-assets.com s.gr-assets.com data:; script-src 'self' c.disquscdn.com disqus.com savjee.disqus.com www.google.com www.google-analytics.com www.gstatic.com apis.google.com goodreads.com www.goodreads.com 'sha256-TBqllJlBMexSGRieFFU5KWd8G9KEcSOtCu0N0HD2OLQ=' 'sha256-A69xDpNgWP5qzy8GbnRIm7q5W/AxoQCnLQMCF7pPl6k=' 'sha256-oGgipIj5gYY2i5nrFigTB2+WfNjyfSVxqFfOl9tM5zY='; style-src 'self' 'unsafe-inline' c.disquscdn.com fonts.googleapis.com; object-src 'none'; upgrade-insecure-requests; report-uri https://savjee.report-uri.com/r/d/csp/enforce;"
}];
{% endhighlight %}

## Hashes for inline scripts
If you look more closely at my CSP you probably notice this:

```
'sha256-TBqllJlBMexSGRieFFU5KWd8G9KEcSOtCu0N0HD2OLQ='
```

That's a base64 encoded SHA256 hash of an inline script. By default a CSP will block any inline Javascript or CSS code. So if you're using Google Analytics (which uses an inline script) you would have to put it in a separate file and include that one.

I didn't want to do that so instead, I took the script and ran it through [this awesome tool](https://report-uri.com/home/hash) to calculate the hash. Once you got that, add it to CSP and you're good to go! Just make sure to put single quotes around your hashes and if you have multiple hashes just add them one after the other.

If you want more details about the hash function used: it's basically a base64 encoded SHA256 hash ;)

![](/uploads/csp-s3-cloudfront/report-uri-hash-tool.png)
*Report URI allows you to quickly calculate the hash of scripts.*

After adding a CSP to my website I was unstoppable and I implement even more security headers!

## strict-transport-security
This policy is frequently called HSTS and basically tells a browser that your website should only be accessed using HTTPS, never over HTTP. So if you have a valid SSL certificate there is no reason not to add this header!

{% highlight js %}
// savjee.be should only be access over HTTPS, never over HTTP
// We also allow browsers to use Google 'preloading' service.
headers['strict-transport-security'] = [{
    key:   'Strict-Transport-Security',
    value: "max-age=31536000; preload"
}];
{% endhighlight %}

When using this header we have to specify how long we want the policy to be cached by browsers. I intend to always have SSL enabled, so I set `max-age` to a high value (1 year).

However, it might still be possible that users first go directly to your non-HTTPS website and are then later redirected to the secure version. This redirection opens the door to man-in-the-middle attacks who could hijack your traffic.

That's why Google maintains an HSTS preload service which tells the browser to never use an insecure connection to load your website. Even when the first request is to an HTTP endpoint! Awesome! To enable this, you simply add the `preload` directive.

## X-Content-Type-Options
This header basically tells a browser not to second the guess the MIME type that was sent by the server. MIME types basically tell the browser how it should interpret the contents of a file. If a file has the `application/javascript` type, then the browser knows the contents of the file is executable code.

However, if a server is wrongly configured and sends javascript as the `plain/text` type, your browser should not execute it. But browsers have become smarter and they can "sniff" or detect that this is probably not plain text and should instead be interpreted as actual code.

Letting the browser guess the MIME type could be a potential security issue. So if your server is correctly set up, we can set the header to `nosniff` and tell the browser to just accept what the server sends.

{% highlight js %}
// Tell the browser that the MIME types that we sent are
// correct and should not be questioned by the browser.
// This only applies to scripts and stylesheets.
headers['x-content-type-options'] = [{
    key:   'X-Content-Type-Options',
    value: "nosniff"
}];
{% endhighlight %}


## X-Frame-Option
Moving along to the next header! This one defines whether or not a browser is allowed to render your website inside an `<iframe>`. These can be abused to perform what's called [a clickjacking attack](https://en.wikipedia.org/wiki/Clickjacking).

{% highlight js %}
// Dont allow the site to be rendered inside an iframe.
headers['x-frame-options'] = [{
    key:   'X-Frame-Options',
    value: "DENY"
}];
{% endhighlight %}


I don't see why people would need to embed my site, so I just `DENY` it!


## X-XSS-Protection
Cross-site scripting attacks (XSS) are pretty nasty and happen when someone injects a bit of Javascript code in your website. This code is then executed by the browser and usually these attacks allow hackers to impersonate people.

A good Content Security Policy (one that doesn't allow inline scripts & unsafe resources) will prevent XSS attacks. However, some older browsers don't support it yet. So that's where this header comes in. It basically instructs the browser to stop loading the page when it detects an XSS attack.

{% highlight js %}
// Tells browser to stop pages from loading when they detect
// reflected cross-site scripting (XSS) attacks
headers['x-xss-protection'] = [{
   key:   'X-XSS-Protection',
   value: "1; mode=block; report=https://savjee.report-uri.com/r/d/xss/enforce"
}];
{% endhighlight %}

Here I use again the reporting service [Report URI](https://report-uri.com) to keep an eye on how many times browsers detect XSS attacks. More about this later!

## Referrer policy
The last header that I configured is about referrer data. When your website has a link to another website and a user clicks on it, the browser will send a "referrer" along to the new websites. This tells it: "Hey, the user came from this website".

However, this can cause privacy issue's, especially if you keep sensitive information in your URL's.

To give you an example of this, let's imagine that user visited a page to update his profile and that this is the URL of that page:

```
https://my-website.com/user_update?name=Xavier&email=hi@savjee.be
```

When the user clicks on an external link, his `name` and `email` will be exposed to the external website because of the Referrer.

Obviously, we don't want to leak any sensitive data to other domains. So my `Referrer-Policy` header only sends the domain name to the external website ( `origin`). That way other people's analytics will still see that `savjee.be` sent them some traffic, but not which page.

{% highlight js %}
// Only send the shortened referrer to a foreign origin,
// full referrer to a local host
headers['referrer-policy'] = [{
    key:   'Referrer-Policy',
    value: "strict-origin-when-cross-origin"
}];
{% endhighlight %}

For a simple blog this might not be necessary, but rather be safe than sorry ;)

## Keeping track of violations
The `Content-Security-Policy` and `X-XSS-Protection` headers both allow you to specify a URL where details about violations should be sent to.

This is pretty interesting, especially when you set up a CSP. It's likely that if you have a large website, your first CSP won't be perfect straight away. It's highly likely that some of your older content is using external resources that you forgot to whitelist.

To monitor these violations, I'm using the [Report URI](https://report-uri.com) service. The free plan allows you to monitor an unlimited amount of sites and can collect 10,000 reports per month. That's pretty generous and in fact more than enough for small to medium sized websites.

All you have to do to set it up is create an account, verify your email address and generate a unique report URL for your website. That's it! Afterward, whenever there is a violation, the service will keep track of it. After just a few hours I saw reports coming in like this:

![](/uploads/csp-s3-cloudfront/report-uri-list.png)
*Report URI showing all my CSP violations with additional info.*

I instantly knew that I forgot to whitelist certain domains. Without a reporting tool, I wouldn't have caught this!

It even visualizes the violations over time, giving you a good indication of what happens when you push a new policy to production. For me it reduces when I whitelisted some additional domains and then sprung right back up:

![](/uploads/csp-s3-cloudfront/report-uri-graph.png)
*CSP violations visualized over time.*

## What does it cost?
The last thing I want to mention is the price. Lambda@Edge is a bit more expensive than just Lambda because your function is replicated across multiple regions and will also receive traffic in these regions.

For me it costs $0.10 per month and my bill looks like this:

![](/uploads/csp-s3-cloudfront/aws-bill.png)
*Lambda@Edge won't break the bank!*

For each region I'm being charged the minimum $0.01 for the amount of computing time my function uses and another $0.01 for the requests.

# More info about headers
Remember that each website requires slightly different headers and configuration. Make sure that you understand what each header does before implementing it. Here are the MDN articles for each header discussed in this post:

* [strict-transport-security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
* [content-security-policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
* [x-content-type-options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options)
* [x-frame-options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)
* [x-xss-protection](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection)
* [referrer-policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy)


# Feedback
Alright, so that's where I'm at in terms of securing this website. What do you think? Did I miss something? Have suggestions for other security measurements? Let me know in the comments!