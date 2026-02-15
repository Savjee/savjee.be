---
layout: post
title: "Static webhosting benchmark: AWS, Google, Firebase, Netlify, GitHub & Cloudflare"
description: "A 2020 speed comparison and benchmark of the top static website hosting providers, including AWS S3/CloudFront, Google Cloud, Netlify, and Cloudflare Pages."
quote:
tags: ["Static webhosting"]
thumbnail: /uploads/2020-05-28-benchmaring-static-website-hosting-providers/poster-750.jpg
upload_directory: /uploads/2020-05-28-benchmaring-static-website-hosting-providers
toc_enabled: true
---

Static websites are still a hot topic. They are fast, and they're incredibly secure because there isn't a CMS to hack. Once you build a static website, however, the question becomes: Where do I host?

In other words: what is the fastest static website hosting provider in 2020? Well, let's find out!

<!--more-->

I did [a similar test in 2017]({% link collections.posts, '2017-10-25-Static-website-hosting-who-is-fastest.md' %}), so it will be curious to see if the hosting providers have been improving.

## Test setup
Just like in 2017, I created a simple webpage that I could host on many services. I opted to use my own homepage, including all the images, CSS, and JS files. I then uploaded these files to the following hosting providers:

* **Pay-as-you-go**
  * [AWS S3](https://aws.amazon.com/s3/) (Region: `eu-west-1`, Ireland)
  * [AWS CloudFront](https://aws.amazon.com/cloudfront/)
  * [Google Cloud Storage](https://cloud.google.com/storage) (regional bucket, `europe-west1`, Belgium)
  * [Google Cloud Storage](https://cloud.google.com/storage) (multi-region bucket)
  * [Cloudflare Workers Sites](https://workers.cloudflare.com/sites) ($5/month)
* **Freemium (some parts free)**
  * [Firebase Hosting](https://firebase.google.com/docs/hosting)
  * [Cloudflare CDN](https://www.cloudflare.com/cdn/)
  * [Netlify](https://www.cloudflare.com/cdn/)
* **Free**
  * [GitHub Pages](https://pages.github.com)

_Quick note_: I did not test Microsoft Azure, because I couldn't sign up for it with my [Revolut Visa card](https://revolut.com/referral/xavierh5x). Thanks, Microsoft!

To check the performance, I used Pingdom and [Oh Dear](https://ohdear.app/). Pingdom measures uptime and response times from [their worldwide network of probe servers](https://my.pingdom.com/probes/feed) while Oh Dear is located in a single location.

Some other things to keep in mind:

* I tested the HTTPS endpoints for all services
* I added `index.html` to all URL's, meaning no time wasted resolving the index document
* The services were probed **once every minute** for **10 days**
* Oh Dear did not only track response times, but also DNS lookup time,  TCP connection time, content download time, and more. Pretty cool! All of the raw data is available at the end of this post.

**Note:** Pingdom or Oh Dear did NOT sponsor this blog post in any way! [Oh Dear](https://ohdear.app/), however, gave me a free trial with enough slots for all the test sites. Thanks a lot!

## Expectations
My expectations are pretty much aligned to when I did this last time around:

* I expect paid services to do better than free servers. There must be a reason for the prices they charge, right?
* Firebase and Google Cloud belong to the same company, so I expect them to perform similarly.
* I use CloudFront for my website, so hopefully they don't come out as a bad option. Otherwise, there's some additional homework for me ;)
* Netlify performed quite inconsistently last time around. With a few years passing, I hope they were able to address those issues.
* Last time, I didn't have Cloudflare in the benchmark. I expect them to be a strong contender, given how popular they are and how many edge locations they have.

## Results
Here's a screenshot from the Pingdom dashboard after 10 days of testing:

![Overview of the Pingdom dashboard](/uploads/2020-05-28-benchmaring-static-website-hosting-providers/pingdom-overview.png)
*Overview of the Pingdom dashboard*

At first glance, it seems that all services perform very consistently, with CloudFront, GitHub Pages, and Google Cloud, leading the pack. But let's not jump to conclusions.

### Uptime
Let's start with uptime. All of these services had 100% uptime, except for Firebase. Pingdom detected 1 minute of downtime. One check returned, "Network is unreachable," and the other returned "Invalid certificate." 

![Firebase downtime as reported by Pingdom](/uploads/2020-05-28-benchmaring-static-website-hosting-providers/pingdom-error-log.png)
*Firebase downtime as reported by Pingdom*

This was not detected by Oh Dear, so I'm willing to give Firebase the benefit of the doubt and say that this was an issue on Pingdom's side.

### Response times
Let's start with some basic statistics: the median, and average response time of each service (including standard deviation):

![Median response times, measured by Pingdom](/uploads/2020-05-28-benchmaring-static-website-hosting-providers/chart-response-times.png)
*Median response times as reported by Pingdom*

A few things might catch your attention:

* CloudFront & GitHub Pages are speedy and consistent. They have the lowest median, average, and deviation. Interesting because one is a paid service, while the other is completely free.
* AWS S3 is the slowest of them all (but performs consistently). It is kind of expected from a hosting provider that is located only in a single region (in this case Ireland, `eu-west-1`)
* Google Cloud's regional and multi-regional buckets perform fairly alike. Interestingly, both are much faster than S3, which is a comparable service. Is Google doing some caching behind the scenes?
* I expected Cloudflare to be much more competitive with the top rankings, but somehow both their CDN and Workers aren't the top performers. Their Workers product does, however, perform slightly better than their CDN.

Since I used both Pingdom and Oh Dear, let's check the difference in median response times:

![Pingdom vs Oh Dear (median response times)](/uploads/2020-05-28-benchmaring-static-website-hosting-providers/chart-response-times-pingdom-oh-dear.png)
*Pingdom vs Oh Dear (median response times)*

Interestingly, Oh Dear is reporting much faster response times compared to Pingdom. This is probably related to the fact that they only test from a single (apparently very well connected) location.

Pingdom is testing from various locations around the world, some of which aren't as well connected, which increases the response times.

Some additional findings:

* Somehow, AWS S3 is the fastest performer, even though the content is only hosted in a single location. It also outperformed Amazon's CDN! Wherever Oh Dear is hosted, it must be somewhere in the EU with good connections to the Ireland region of AWS.
* The difference between CloudFront, S3, Firebase, GitHub Pages, and Google Cloud Storage is minimal. Once more, showing that free and paid services compete quite closely with one another.

### Time to first byte
Oh Dear also kept track of other metrics like how long it took for the first bytes to start being transferred. This can give us an indication of how responsive the webserver is (how long does it need to think before being able to fulfill a request).

![Time to first byte: measures responsiveness of web servers](/uploads/2020-05-28-benchmaring-static-website-hosting-providers/chart-time-to-first-byte.png)
*Time to first byte: measures responsiveness of web servers*

* The "simple" storage services like S3 and Google Cloud Storage are doing very well.
* Once again, GitHub Pages, Firebase, and CloudFront are great performers, delivering the first byte in under 40ms.
* Surprisingly, Cloudflare is taking quite a while to start delivering the first bytes. Maybe this is due to all of their protection services?

### Compared to 2017
Comparing this new data with the one from 2017 reveals that not much has changed. Note that here I'm comparing the data from Pingdom:

![Benchmark from 2017 vs 2020: median response times](/uploads/2020-05-28-benchmaring-static-website-hosting-providers/chart-response-times-2017-vs-2020.png)
*Benchmark from 2017 vs 2020: median response times*

All providers (except GitHub Pages) have become slightly slower. Most noticeably AWS S3 (+13%) and Firebase (+31%). The others are so close to their 2017 performance that I would consider these differences to be in the margin of error.

Netlify has a slower median response time in 2020 compared to 2017. But it did improve massively on its consistency. Last time around, they had weird spikes in performance but not anymore. Nice!

This could be explained by Pingdom having added additional test servers located in areas that are further away from these providers.


### Trying to find edge cases
A scatter plot reveals that there aren't many outliers, and no service is suffering from regular spikes in performance. There are some outliers here and there, but I wouldn't look into them too much:

![Scatter plot of all response times](/uploads/2020-05-28-benchmaring-static-website-hosting-providers/chart-scatter-response-times.png)
*Scatter plot of all response times*

If we visualize the response times with a box plot, we see something interesting:

![Box plot of response times, showing some high spikes](/uploads/2020-05-28-benchmaring-static-website-hosting-providers/chart-boxplot-response-times.png)
*Box plot of response times, showing some high spikes*

All services, except for AWS, GitHub Pages, and Firebase, have weird spikes. Last time around, this was only limited to Netlify. Not sure what to make of these, but I'm guessing it's more related to Pingdom's tests than to the services themselves.

## Conclusions
Time to draw some conclusions:

The best all-around performer is **AWS CloudFront**, followed closely by **GitHub Pages**. Not only do they have the fastest response times (median), they're also the most consistent.

They are, however, closely followed by Google Cloud Storage. Interestingly, there is very little difference between a regional and multi-regional bucket. The only reason to pick a multi-regional bucket would be the additional uptime guarantee.

**Cloudflare** didn't perform as well I would've expected. It's certainly faster than a standard S3 bucket but falls away when compared to other CDN's like CloudFront. Their Workers product is slightly faster than their CDN, but it's hard to recommend it when it costs $5 a month, and free products like GitHub Pages perform better.

Netlify has improved big time; the spikes in performance are gone and performs in line with Google Cloud and Firebase hosting.

## Which should you choose?
If you want a fast website without breaking the bank, go for GitHub Pages. It's completely free and super fast. It does, however, require you to open source your site.

If that's not doable, CloudFront is a good alternative, but its price depends on how much bandwidth you push around. For most personal sites, CloudFront won't cost more than a couple of dollars per month. The same thing goes for Google Cloud Storage.

Netlify and Firebase Hosting are pretty solid choices as well. While they don't perform as well as CloudFront or GitHub Pages, they make up for it with excellent development tools. Everything works out-of-the-box with no configuration required on your end. Just push your website live with their easy to use CLI tools.

## Download the data
The raw CSV data [is available on GitHub](https://github.com/Savjee/static-website-hosting-benchmark). Both of 2017 and 2020. Feel free to do your analysis and let me know if you find other interesting things in the dataset. Definitely check out the detailed statistics from Oh Dear!
