---
layout: post
title: Enable gzip for Jekyll blogs on Amazon S3
keywords: jekyll, ruby, S3, amazon, AWS, cloud, gzip, fast, compression
quote: Speed up your Amazon S3 hosted Jekyll blog by enabling gzip compression.
upload_directory: jekyll-s3-deploy-gzip
---

A little over a year ago [I moved away from Wordpress and started using Jekyll for this blog]({% post_url 2013-01-14-moving-from-Wordpress-to-Jekyll %}). I also [started using Amazon S3 as a cheap but very reliable hosting provider]({% post_url 2013-02-01-howto-host-jekyll-blog-on-amazon-s3 %}).

The past weeks I've looked into ways to speed up my blog even further without using a CDN. One technique that is used very frequently is [enabling gzip compression](https://developers.google.com/speed/docs/insights/EnableCompression). In this post I'll walk you through the steps I took to serve gzipped content from Amazon S3.

<!--more-->

# Why gzip?
Let's start with the why: "Why would you want to serve a gzipped copy of your website to users?"

* Gzipping your content means **smaller** content. Smaller content = faster downloads = less loading time and a happy user!
* Smaller content also means reduced outgoing bandwidth, so you'll end up saving money on your S3 bill.

Gzip is very effective in compressing HTML and CSS files since most text is repeated multiple times. Codes like ``<div>`` and ``<p>`` are used very frequently throughout HTML pages and a lot of whitespace can be compressed as well.

The first question I asked myself was: "How much smaller is gzip going to make my webpages?". I took an uncompressed version of my [Hackintosh blog post]({% post_url 2012-12-28-building-a-hackintosh %}) and compared it to the compressed version. The uncompressed page was 10217 bytes long while the compressed version was just 4538 bytes long. That's a **44% reduction** for a pretty small page!

# One way road
Serving gzipped content from S3 is a one way road. It's all or nothing. Once enabled, all your visitors **have to support** gzip compression.

Regular web servers can be configured to only serve gzipped content to clients who support it. On S3 you don't have this option.

Luckily though, [gzip support is included in all recent browsers](http://schroepl.net/projekte/mod_gzip/browser.htm). Dropping support for very old browsers (or bad proxies) isn't a big deal for me. All of my visitors are running pretty recent versions of browsers anyway and web crawlers like Googlebot can also handle gzip.

# Deploying
When you want to deploy a gzipped website to S3 you have to **compress every file before uploading it**! I use a bash script to deploy my website to S3, so it would be nice to make everything automated. So let's modify my original script with these new requirements: 

* Gzip all HTML, CSS and Javascript resources before uploading them to S3.
* Serve the compressed content to users (setting the correct headers).

Beside enabling gzip I also had a "nice to have" feature:

* Support for my live and staging environments (www.savjee.be and staging.savjee.be).

# Implementation
Here is the new script that I currently use to automatically deploy my website to S3:

{% highlight bash %}
##
# Configuration options
##
STAGING_BUCKET='s3://staging.savjee.be/'
LIVE_BUCKET='s3://www.savjee.be/'
SITE_DIR='_site/'

##
# Usage
##
usage() {
cat << _EOF_
Usage: ${0} [staging | live]
    
    staging		Deploy to the staging bucket
    live		Deploy to the live (www) bucket
_EOF_
}
 
##
# Color stuff
##
NORMAL=$(tput sgr0)
RED=$(tput setaf 1)
GREEN=$(tput setaf 2; tput bold)
YELLOW=$(tput setaf 3)

function red() {
    echo "$RED$*$NORMAL"
}

function green() {
    echo "$GREEN$*$NORMAL"
}

function yellow() {
    echo "$YELLOW$*$NORMAL"
}

##
# Actual script
##

# Expecting at least 1 parameter
if [[ "$#" -ne "1" ]]; then
    echo "Expected 1 argument, got $#" >&2
    usage
    exit 2
fi

if [[ "$1" = "live" ]]; then
	BUCKET=$LIVE_BUCKET
	green 'Deploying to live bucket'
else
	BUCKET=$STAGING_BUCKET
	green 'Deploying to staging bucket'
fi


red '--> Running Jekyll'
Jekyll build


red '--> Gzipping all html, css and js files'
find $SITE_DIR \( -iname '*.html' -o -iname '*.css' -o -iname '*.js' \) -exec gzip -9 -n {} \; -exec mv {}.gz {} \;


yellow '--> Uploading css files'
s3cmd sync --exclude '*.*' --include '*.css' --add-header='Content-Type: text/css' --add-header='Cache-Control: max-age=604800' --add-header='Content-Encoding: gzip' $SITE_DIR $BUCKET


yellow '--> Uploading js files'
s3cmd sync --exclude '*.*' --include '*.js' --add-header='Content-Type: application/javascript' --add-header='Cache-Control: max-age=604800' --add-header='Content-Encoding: gzip' $SITE_DIR $BUCKET

# Sync media files first (Cache: expire in 10weeks)
yellow '--> Uploading images (jpg, png, ico)'
s3cmd sync --exclude '*.*' --include '*.png' --include '*.jpg' --include '*.ico' --add-header='Expires: Sat, 20 Nov 2020 18:46:39 GMT' --add-header='Cache-Control: max-age=6048000' $SITE_DIR $BUCKET


# Sync html files (Cache: 2 hours)
yellow '--> Uploading html files'
s3cmd sync --exclude '*.*' --include '*.html' --add-header='Content-Type: text/html' --add-header='Cache-Control: max-age=7200, must-revalidate' --add-header='Content-Encoding: gzip' $SITE_DIR $BUCKET


# Sync everything else
yellow '--> Syncing everything else'
s3cmd sync --delete-removed $SITE_DIR $BUCKET
{% endhighlight %}

(The full script is available [on GitHub](https://github.com/Savjee/savjee.be/blob/1a84362c4424ecd2ee7d368298ed30c218a2d66a/_deploy.sh))

With one command I can deploy my website to my staging environment (``sh _deploy.sh staging``) or to my production environment (``sh _deploy.sh live``). The script is pretty simple and I'm sure there's room for improvement.

Let's take a more detailed look at the script:

## Configuration section
The configuration section is used to define a few variables that are used later on:

* The ``LIVE_BUCKET`` and ``STAGING_BUCKET`` variables store the names of the S3 buckets to deploy to
* ``SITE_DIR`` stores the location of the generated website (If you use Jekyll this is ``_site/`` by default)

## Color section
This section provides the rest of the script with 3 functions to echo text in color. It's something I found in [a blog post of Fizer Khan on shell scripts](http://www.fizerkhan.com/blog/posts/What-I-learned-from-other-s-shell-scripts.html#colors-your-echo).

It's not a real requirement but it makes the output look good:

<img src='/uploads/jekyll-s3-deploy-gzip/1.png'>

## Gzipping
Because we want to gzip content, we have to find each HTML, CSS and Javascript document in the ``SITE_DIR`` directory and compress it with gzip:

* The script uses the ``find`` command to look for all HTML, CSS and Javascript files inside my generated website directory. 

* Every file that matches this criteria is compressed with gzip. I use the best compression available (``-9``) and prevent gzip from storing filename and timestamp in the output file (``-n``). Without the ``-n`` parameter, gzipped files will always have a different hash. Nothing wrong with that, except that S3cmd thinks that all your files changed. This causes it to re-upload **ALL** your files every single time you deploy. This is a waste of time and bandwidth!

* Finally, the script fixes the extension. Gzip automatically appends ``.gz`` after it's finished compressing a file. The file ``index.html`` becomes ``index.html.gz`` once compressed. Even though browsers understand gzipped content, you can't serve them with a ``.gz`` extension. So each file is renamed so it has the original file extension.


# File size comparison
Does gzip really matter? Does it really compress webpages with a large factor? Well, yes it does:

<img src="/uploads/jekyll-s3-deploy-gzip/2.png">

Notice that the difference in size for small webpages isn't that great. But once pages become bigger, the advantage of gzip becomes clear.