---
layout: post
title: Static website hosting&#58; who's fastest? AWS, Google, Firebase, Netlify or GitHub?
quote:
tags: ["Static webhosting"]
---

I've been hosting this website on AWS since 2012 and a lot has changed in the cloud business. So I was wondering if AWS Cloudfront is still the best place to host my static website. What about Google Cloud Storage, Firebase Hosting, Netlify or GitHub Pages?  How do they stack up?

Well let's find out!

<!--more-->

This blog post is about a benchmark I did in 2017. [I repeated this in 2020 with more tests & more providers]({% link collections.posts, '2020-05-28-benchmarking-static-website-hosting-providers.md' %}).

## What I tested
I started by creating an account on a few public clouds that allow you to host static websites. Static websites are built using only HTML, CSS and Javascript so basic storage is sufficient. I ended up creating an account on these services:

* Pay-as-you-go
  * [Amazon S3](https://aws.amazon.com/s3/) (direct access to the bucket)
  * [CloudFront](https://aws.amazon.com/cloudfront/) (with S3 bucket as origin)
  * [Firebase Hosting](https://firebase.google.com/docs/hosting/) (has a free tier)
  * [Google Cloud (regional bucket)](https://cloud.google.com/storage/)
  * [Google Cloud (multi region bucket)](https://cloud.google.com/storage/)
* Free
  * [Netlify](https://www.netlify.com/)
  * [GitHub Pages](https://pages.github.com/)

I also created a simple website to host on all of these service. I simply took my website's homepage with all of the assets that belong to it and uploaded it to all these services. The homepage is about 10kb in size (just the html).

To test the performance of each service, I signed up for Pingdom's free 14-days trial. They measure uptime and response time from [their world wide network of probe servers](https://my.pingdom.com/probes/feed). I created one check for each service and only used the HTTPS endpoints. I also added ``/index.html`` to each URL so no time was wasted on resolving the index document. I configured each check to run every minute for the next **10 days**.

On the last day I terminated the checks and downloaded the raw data CSV for analysing.

## Some more details
Let's talk a bit about how I configured each service.

**Netlify, GitHub Pages and Firebase Hosting** are the simplest options for hosting a static website. Just give them your files and they will host them for you. There is almost no configuration and you don't get to mess with settings. So I didn't!

**S3 and Google Storage** are a little bit more complicated. For storage buckets you have to pick a region. On S3 I chose the ``eu-london`` region and for the Google regional bucket I chose ``europe-west2`` (which is also located in London).

I tried to keep the default settings for each service as much as possible. I only changed **CloudFront's** configuration to enable HTTPS.


## Expectations
So before we dive into the results: what are my expectations?

* **Payed service** will outperform the free alternatives. It would make sense because you pay for them to be fast!

* **Google Cloud** will probably be really fast, they're Google after all. Same for **Firebase** since they are part of Google!

* **CloudFront** is whatI use for my site and it's no slouch. Hopefully the results will reflect this.

* **Netlify** uses a combination of their own CDN and third-paty CDN's. That means more endpoints, so probably more speed.

* **GitHub Pages** is used by a lot of open source projects so I guess it has to be good as well!

Enough with the expectations. Let's see how they actually stack up against each other...

## Results
So what did the results look like? Well here is the overview on Pingdom:

![Pingdom's Dashboard](/uploads/static-website-hosting-who-is-fastest/pingdom.png)

On first sight you could say that GitHub Pages is the fastest and that everyone performs fairly consistently. Netlify however is somewhat weird. It performs really fast but it has huge spikes in it's graph.

Let's take a closer look. I exported all the raw data into CSV and analysed them with Excel. Let's start with the most basic statistics: the median and average response times with the standard deviation.

![Pingdom's Dashboard](/uploads/static-website-hosting-who-is-fastest/chart-1.png)

There are a few things that immediately catch our attention:

* S3 is a lot slower compared to others
* Netlify has a high standard deviation which might point to inconsistent performance
* The other services are almost equal in terms of performance

**S3** performing considerably worse than others is related to the fact that an S3 bucket is locked to a region. In my case the ``eu-west-1`` region, which is located in London. Pingdom runs tests from all over the world meaning that their European servers will see faster response times compared to servers in the US or Asia. S3's bad performance was expected. It doesn't use any CDN (that's what CloudFront is for) and it being locked to a specific region doesn't help.

The only reason I included S3 in this test was to compare it to Google's regional bucket. On **Google's side** we see something funny: the regional and multiregional bucket have an almost identical performance. Google is pretty vague on how it does this. Their website mentions that they cache your content around the world but they're not talking details. Still, it's nice to see that it works so well out of the box!

**Netlify** on the other hand suffers from spikes in it's performance (as we could see on the Pingdom website). It's average and median response times are very good, but the deviation is far too high. Maybe something to do with their "hybrid" CDN solution?

A scatter chart of all the response times clearly shows the variances in Netlify's performance:

![Pingdom's Dashboard](/uploads/static-website-hosting-who-is-fastest/chart-2.png)

It becomes even more apparent when we draw a boxplot of the data:

![Pingdom's Dashboard](/uploads/static-website-hosting-who-is-fastest/chart-3.png)

It clearly shows that the highest response time recorded from Netlify is way higher than any other service.

We can also make some other interesting observations:

* **Firebase hosting** is not only fast, it's very consistent! The highest response time is still a lot faster than other services' maximum response time.
* **S3** is a lower maximum value then CloudFront, maybe an issue in measurement? Still CloudFront other test results are much faster and more consistent compared to S3.
* **Google's multiregional bucket** recorded a higher maximum then a regional bucket. That's a bit weird, but again it's probably an error in the measurement. If you look more closely you see that for the vast majority of measurements, the multiregion bucket performs slightly better.
* **GitHub Pages** is comparable to Firebase Hosting and Google Storage buckets. Very strong performance from a free service with no real hard limits.

## Conclusions
So time to draw some conclusions. All these services are great options for hosting your static websites.

The best all-round performer is without a doubt **Firebase hosting**. Not only is it fast, it was the most consistent during my test.

Firebase is followed closely by **GitHub Pages**. They have a faster average and median response time but have a slightly higher standard deviation.

Closely after them is **CloudFront** and **Google's Storage** buckets. Again I was surprised at how good Google's bucket performed without any additional configuration.

**Netlify** was a weird one. It has very good performance and is comparable to the other services here. However during my test they did have some spikes in performance and didn't perform as consistently as the others. Still, it's an amazing result, considering that it's a free service.

**S3** (without CloudFront) was considerably slower then the others, but that's to be expected given that it doesn't use a CDN by default.


## Which one should you choose?
That's a bit tricky. If you want a completely free solution then you should definitely consider GitHub Pages. You do have to make your website open source though.

Don't want to make your website open source but still want to host it for free? Well then Firebase Hosting is probably your best bet. It's not completely free, but it does have a free tier that should be sufficient for small websites. Netlify is also an option here and should perform well for most of the time.

For payed solutions there isn't really much of a difference. If you're after speed both AWS CloudFront and Google's storage buckets are great options. Choosing between these is difficult, so try to pick one you're already familiar with or the one with the cheapest pricing.


## Download the data
Want to do your own analysis? [The raw CSV exports from Pingdom are available on GitHub](https://github.com/Savjee/static-website-hosting-benchmark).
