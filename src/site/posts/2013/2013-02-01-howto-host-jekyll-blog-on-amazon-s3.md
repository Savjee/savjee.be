---
layout: post
title:  Hosting a static (Jekyll) blog on Amazon S3
quote: Hosting your static Jekyll blog or website on Amazon S3 has a lot of advantages. Your website will be faster and won't go down and to tip it off, you can automatically deploy new versions to S3 in a matter of seconds.
keywords: Blog, Amazon S3 hosting, static website, cheap hosting, deploy to Amazon S3, deploy with s3cmd, s3cmd, bash script
upload_directory: host-blog-s3
tags: [AWS, Jekyll, "Static webhosting"]
---

A few weeks ago [I started using Jekyll]({% link collections.posts, '2013-01-14-moving-from-Wordpress-to-Jekyll' %}) for my blog and moved it to Amazon S3. I also [configured AWStats to analyze Amazon S3 access logs]({% link collections.posts, '2013-01-21-Using-AWStats-to-analyze-Amazon-S3-logs' %}). Yet, I never explained how I moved to S3, how I automatically deploy my website and what effects S3 has on a website's performance.

<!--more-->

{% include "youtube-embed.html", videoId:'g9NbuTcos18' %}

## Hosting on Amazon S3
Since Jekyll websites are static, you can host them practically everywhere. But why would you choose S3 as a hosting provider?

* S3 is **reliable**. Amazon's SLA [guarantees](http://aws.amazon.com/s3-sla/) 99.9% uptime, not bad! 

* Compared to my previous web host **S3 is fast**. The whole site now loads in less than half a second compared to over a second on my previous host.

* **S3 is resilient and scales!** Most web hosting providers limit the storage and bandwidth you can use. Cheap plans offer little space and bandwidth, expensive plans offer more. Kind of obvious but stay with me: What happens if you have a cheap plan and are suddenly featured on a major news website? Well, you go over the quota and your visitors see a nice "*Error 509: Bandwidth limit exceeded*" message. This isn't a problem for S3. It can scale from a few visitors per minute to dozens every second!

* You **pay for what you used**. Traditional hosting providers charge a fixed fee every month. With S3 you only pay for what you use. For the first year Amazon gives you 5GB of (standard) storage and 15GB of outbound traffic each month. Should be enough for a small website.

Now that you know the advantages of S3, let's set it up!

### Creating a bucket
Before you can host a website on S3 you need to create a bucket. 

1. Login to the [AWS Management Console](https://console.aws.amazon.com/) and select S3
2. Click "Create Bucket"
3. The name of the bucket should be your domain name. In my case: www.savjee.be
4. No need for logging, just click "Create". ([You could enable logging to keep a detailed access log]({% link collections.posts, '2013-01-21-Using-AWStats-to-analyze-Amazon-S3-logs' %}))

![Creating a new bucket](/uploads/host-blog-s3/create-bucket.png)

By default, the option to host a static website in your bucket is disabled. To enable it:

1. Go to the properties of your bucket
2. Under "Static Website Hosting" you'll find the option "Enable website hosting". Click it!
3. Finally you have to tell Amazon where your index and 404 pages are. In my case *index.html* and *404.html*
4. Save the settings

![Creating a new bucket](/uploads/host-blog-s3/enable-hosting.png)

Your S3 account is all set!

### Automatic deployments to S3
Every time you update your blog it has to be uploaded to S3. This can be a tedious task so let's automate it!

I choose to use the command line S3 client, [s3cmd](http://s3tools.org/s3cmd). You can install it by downloading the package and running:

<pre>
sudo python setup.py  install
</pre>

If everything went right, you should get something like this:
<pre>
Using xml.etree.ElementTree for XML processing
running install
running build
running build_py
running build_scripts
running install_lib
running install_scripts
changing mode of /usr/local/bin/s3cmd to 755
running install_data
running install_egg_info
Removing /Library/Python/2.7/site-packages/s3cmd-1.1.0_beta3-py2.7.egg-info
Writing /Library/Python/2.7/site-packages/s3cmd-1.1.0_beta3-py2.7.egg-info
</pre>

s3cmd needs to be configured so it can access your S3 buckets and files:
<pre>
s3cmd --configure
</pre>

The program will ask you some basic things about your Amazon S3 account. (I left the "Encryption password" empty. It's pointless to encrypt your websites files since they are public anyway)

Now that s3cmd is set up correctly you can use it to deploy your blog. This is the script I use:

{% highlight bash %}
# Run Jekyll
echo "-> Running Jekyll"
Jekyll

# Upload to S3!
echo "\n\n-> Uploading to S3"


# Sync media files first (Cache: expire in 10weeks)
echo "\n--> Syncing media files..."
s3cmd sync --acl-public --exclude '*.*' --include '*.png' --include '*.jpg' --include '*.ico' --add-header="Expires: Sat, 20 Nov 2020 18:46:39 GMT" --add-header="Cache-Control: max-age=6048000"  _site/ s3://www.savjee.be/

# Sync Javascript and CSS assets next (Cache: expire in 1 week)
echo "\n--> Syncing .js and .css files..."
s3cmd sync --acl-public --exclude '*.*' --include  '*.css' --include '*.js' --add-header="Cache-Control: max-age=604800"  _site/ s3://www.savjee.be

# Sync html files (Cache: 2 hours)
echo "\n--> Syncing .html"
s3cmd sync --acl-public --exclude '*.*' --include  '*.html' --add-header="Cache-Control: max-age=7200, must-revalidate"  _site/ s3://www.savjee.be

# Sync everything else, but ignore the assets!
echo "\n--> Syncing everything else"
s3cmd sync --acl-public --exclude '.DS_Store' --exclude 'assets/'  _site/ s3://www.savjee.be/

# Sync: remaining files & delete removed
s3cmd sync --acl-public --delete-removed  _site/ s3://www.savjee.be/
{% endhighlight %}


Let me explain some of the parameters that I used:

* ``--acl-public`` makes sure that every file that is uploaded to S3 is public and can be viewed in the browser. Note that this is applied to **every file** that s3cmd uploads. Watch out if you keep some private files in your site's directory. 

* ``--exclude '.DS_Store'``. This tells s3cmd to ignore Mac OS X's .DS_Store files. They don't have anything to do with your website. No need to upload them. 

* ``add-header="Cache-Control: max-age=604800"`` sets the cache-control for certain elements. Let's the browser know that it can cache certain files (images, css and javascript).

* ``--delete-removed`` makes sure that if you deleted a file locally it is also deleted on S3.


You might say that one ``s3cmd sync`` command would be enough to upload your website to Amazon S3 and you would be correct! However, with that approach you can't specify cache rules. In my case, media files are cached for 10 weeks, javascript and CSS files for 1 week and HTML files for 2 hours.

That's it. Everytime I want to publish my blog I run ``sh _deploy.sh`` and sit back. Everything is taken care of. No worries.

*Note: I initially used reduced redundancy storage for hosting my website. This raised by bill to a whopping 0.01 dollars ;). Amazon's free tier gives you 5GB of **standard** storage, not reduced storage. So use that if you're eligible for the free tier.* 

### DNS changes
Once you uploaded your website to S3 and enabled website hosting you can access your website through a very long URL. Like this one: [www.savjee.be.s3-website-eu-west-1.amazonaws.com](http://www.savjee.be.s3-website-eu-west-1.amazonaws.com). No way a user can remember that!

Hooking up your own domain is a bit more difficult. A website is usually accessible directly (savjee.be) or through it's www subdomain (www.savjee.be). Make a new CNAME record from your www subdomain to the super long URL Amazon gives you. 

To map your root domain to S3 you'll need a third party service to redirect requests (a root domain can't be a CNAME record). I used the free [wwwizer.com](http://wwwizer.com/naked-domain-redirect) service. Point your domain's A record to 174.129.25.170 and you're all set!

*[You could also use Amazon Route 53](http://aws.typepad.com/aws/2012/12/root-domain-website-hosting-for-amazon-s3.html). This is probably a better and more reliable option. I might use this in the future.*

## Performance benefits of S3
S3 is a cheap way to host your website but how does it perform? To test this, I used Pingdom's [Full Page Test](http://tools.pingdom.com/fpt/). I benchmarked my old Wordpress installation, Jekyll on my old hosting provider and Jekyll on S3. All tests were performed 5 times and the average was taken. (Test location was Amsterdam, Netherlands. Speeds can vary in different parts of the world)

The results speak for themselves. Wordpress was incredibly slow on my cheap web hosting plan, taking almost 5 seconds to render a page. We can't compare this to S3 because Wordpress doesn't run on it. But it does give you a good idea of how slow my blog was before I moved to Jekyll. Load times like these are simply unacceptable!

The static version is much better, bringing the average load time down from almost 5 seconds to just over a second. Move that same website to S3 and you shave off another 0.5 seconds, bringing the total load time to half a second! That's zippy!

![Chart](/uploads/host-blog-s3/benchmark.png)

According to Pingdom: "Your website is faster than 97% of all tested websites". If you test from a US based location it's slightly less: "Your website is faster than 84% of all tested websites".

## Even faster?
The performance of Amazon S3 will vary depending on the bucket location. Since mine is located in Ireland, the best speeds will be achieved by visitors coming from Europe. To supercharge your website for everyone you could serve it through Amazon's CDN, [CloudFront](http://aws.amazon.com/cloudfront/).

I'm already pretty happy with the performance of my website, so I'm not going to use CloudFront. Follow [this guide](http://vvv.tobiassjosten.net/development/jekyll-blog-on-amazon-s3-and-cloudfront/) if you want to go for über speed. 

## Conclusion
Unless you have a really, really good web host, hosting your static website on Amazon S3 is a no-brainer. It's fast, cheap and has amazing uptime.