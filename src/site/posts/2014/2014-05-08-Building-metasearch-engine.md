---
layout: post
title:  Building a meta-search engine
description: "How I built a meta-search engine that indexes 3 million items using PHP, MariaDB, and Sphinx search server. Technical walkthrough included."
keywords: Metasearch, search engine, PHP, MariaDB, Sphinx, search, ranking, database, index
quote: In this post I'll walk you through the technical aspects of building a meta-search engine with PHP, MariaDB and Sphinx. Capable of searching through millions of records!
thumbnail: true
upload_directory: /uploads/building-metasearch-engine
toc_enabled: true
---

At the end of 2012 [I launched](http://www.nieuwsblad.be/article/detail.aspx?articleid=DMF20121112_00366062) a search engine that combined the offerings of six different second hand websites in Belgium. It was called 'Zoekertjesland' and indexed well over 3 million items.

Last week however I unplugged the server and stopped the project. I'm a student and renting [a VPS](http://www.versio.nl/?pa=16767awybe) for 2 years without any income from the website is costly.

In this post I'll walk you through the technical aspects of building a meta-search engine like this one (with PHP, MariaDB and Sphinx).

<!--more-->

## Overall setup & goals
Before we dive into the technical aspects of building a meta-search engine, let's take a look at the goals that I had for this project:

* First of all, the search engine needed to be able to search very quickly through a few million items. People don't like waiting for search results!
* It had to run on a relatively small VPS (1CPU core, 1GB RAM, 100GB HDD storage).
* The index of second hand items needs to be as fresh as possible. When an item is sold, it should be removed from the index.

The setup that I came up with is pretty small, yet efficient enough to run on a relatively small VPS:

![Overall setup of the website](/uploads/building-metasearch-engine/setup.png)

* **PHP**: to power the website and its crawlers. This was my language of choice at the time (actually it still is, but I like other languages as well).
* **Crawlers**: run continuously in the background and scrape data from several websites. 
* **Database**: responsible for storing **all** the data that the crawlers fetched. I originally started using MySQL but moved to MariaDB after a server migration.
* **Sphinx**. Searching directly on a large, busy database isn't a great idea. To handle search queries, I choose to use Sphinx. This open source search server can index large databases and quickly search through them.


## Crawlers
The crawlers are PHP scripts that are running continuously in the background, scraping data from several websites. I wrote one crawler for every website I wanted to index. The data that they gather (id, title, description, url, ...) is stored in the MariaDB database. Each entry gets a ``last_updated`` attribute to keep track of how long it has been since it was last updated.

Choosing PHP for the crawlers might seem like a stupid idea. After all, it's an interpreted language that isn't really known for its speed. During the development I rewrote one of the crawlers in Java using [jsoup](http://jsoup.org/). Performance of the Java version was a lot better than the PHP crawlers (up to 3 times faster) but the crawlers used far more memory. In fact, I wasn't able to run multiple Java crawlers simultaneously on my VPS (maybe my Java skills are to blame?). So I decided to stick to the language I knew best (and felt most comfortable with) and to sacrifice some performance for it.

The PHP crawlers use [cURL](http://www.php.net/manual/en/book.curl.php) to fetch web pages and [Simple HTML DOM Parser](http://simplehtmldom.sourceforge.net/) to extract the contents of them. I choose to use cURL because it allows you to control things like timeout and redirects ([it's also faster](http://stackoverflow.com/questions/5844299/using-file-get-contents-or-curl) than ``file_get_contents``).

### Keeping the crawlers running
The crawlers are written to keep running, even in the case of errors. However, it sometimes happens that one of the scripts crashes. To keep the scripts running, I triggered **each crawler** every 5 minutes with a cronjob.

You might think, wait a minute! That means that after 10minutes you'd have two instances of the same script running. You would be correct! When I was testing the scripts I didn't realise this and ended up with many instances of every crawler. To fix this, I used this piece of PHP code:

{% highlight php startinline %}
$fp = fopen(__FILE__, 'r+');

if(!flock($fp, LOCK_EX | LOCK_NB)){
    die("\n\n Crawler already running \n \n");
}
{% endhighlight %}

This code tries to lock the current PHP file. If it fails to lock the current file it knows that another instance is already running and dies. If this file wasn't locked already, it gets locked and the crawler starts. If a running script suddenly stops, the lock is released and a new instance will be spawned by cron. It is simple but very effective! This way I was sure that each crawler would get restarted within 5 minutes if something went wrong. This is an example of a cronjob for a crawler:

<pre>
*/5 * * * * /usr/bin/php /zoekertjesland/crawlers/crawler_2dehands.php >> /zoekertjesland/logs/crawler_2dehands.txt
</pre>

## MariaDB
The site originally used a MySQL back-end to store all the data of an item. I choose InnoDB as the storage engine because it uses row locking. This enables multiple crawlers to update data simultaneously, without having to wait on each other. 

This is the data that was stored for each item:

* ID (An internal ID and the ID on the external website)
* Title
* Description
* Price
* Location
* URL
* Picture URLs

After a few months of running the website, my hosting provider launched [a new VPS platform](http://www.versio.nl/?pa=16767awybe). I decided to move since the new platform gave users more RAM for about the same price. While I was moving I switched from MySQL to MariaDB. There wasn't a real benefit to it. I just wanted to work with something that was getting a lot of attention. The switch was painless as MariaDB is a drop-in replacement for MySQL!

## Sphinx
After a few hours of running the crawlers, the database was populated with well over 3 million items. I figured this number might grow rapidly when I would write new crawlers for new websites. Searching through this database was painfully slow since InnoDB didn't support full text search indexes at the time.

I quickly found a popular, open source search server: [Sphinx](http://sphinxsearch.com/). It fetches data from a source (in this case the MariaDB database) and creates an index that can be searched in milliseconds. It also has [an amazing set of features](http://sphinxsearch.com/docs/current.html#features) and is small and efficient.

So went on installing Sphinx on the server and setting everything up. Sphinx indexes all the data that a source gives it. I configured it to index the id, title, description, price and location fields of each item. Indexing the price might seem odd but allows for queries like these: "Give me all items with a price between X and Y". The same goes for the location: it's nice to be able to only show items that are located close to you.

<pre>source src1
{
    type = mysql
    sql_host = 127.0.0.1
    sql_user = sphinx
    sql_pass = XXXXXXXXXXX
    sql_db = Zoekertjesland
    sql_port = 3306

    sql_query = SELECT id, Title, Descr, Price, UNIX_TIMESTAMP(last_update) AS last_update, location_id FROM zoekertjes

    sql_attr_timestamp = last_update
    sql_attr_uint = Price
    sql_attr_uint = location_id
}</pre>


The last part of the configuration was to set up the index and search daemon. This is mostly the default configuration:
<pre>
index zoekertjesland
{
    source = src1
    path = /zoekertjesland/sphinx/index
    docinfo = extern
    charset_type = sbcs
}

indexer
{
    mem_limit = 32M
}

searchd
{
    port=65490
    log = /zoekertjesland/logs/sphinx_log.log
    query_log = /zoekertjesland/logs/sphinx_query.log
    read_timeout = 5
    max_children = 30
    pid_file = /var/run/searchd.pid
    max_matches = 1000
    seamless_rotate = 1
    preopen_indexes = 0
    unlink_old = 1
    listen = 127.0.0.1
}
</pre>

I won't go into much detail here. Setting up Sphinx is really easy if you read [the documentation](http://sphinxsearch.com/docs/current.html). This post isn't a guide on setting everything up. It's just to show the architecture of a meta-search engine.

## Keeping the index fresh
There is one problem though. What happens to second hand items that where sold and removed from the original websites? They are still stored in the database and even worse, they are being displayed to users as results!

At first I thought about writing a script that visits the URL of each item and verify that it is still alive. But this would be a time and bandwidth consuming activity with 3 million items!

The solution was much simpler though. The crawlers took between 1 and 2 days to completely re-crawl all six indexed websites. Removed articles won't be re-crawled and thus won't be updated. This means that these items will carry a ``last_updated`` data thats older than 2 days.

To keep the database clean, all I had to do was write a script that removes all items that haven't been updated in the last 2 days. This script runs everyday and keeps the index fresh. It's a very simple and efficient solution. Broken links where rarely encountered by users.

## The front-end
Every search engine needs a front-end and the one I built was pretty simple. The homepage featured a Google-like design with just a search box and submit button.

![The homepage of Zoekertjesland](/uploads/building-metasearch-engine/homepage.png)

The results page was simple as well. It was generated by PHP and featured some filtering and sorting options:

![A result page from Zoekertjesland](/uploads/building-metasearch-engine/resultspage.png)

![The sorting options of Zoekertjesland](/uploads/building-metasearch-engine/sortingoptions.png)

So far I've talked about the front and back-end. Let's talk about the bridge between the two!

## Journey of a query
A lot happens behind the scenes when a user sends a query to the search engine. Let me explain how the independent systems work together to show up results. This is the sequence diagram for a query on Zoekertjesland:

![Sequence diagram of a search query](/uploads/building-metasearch-engine/search-query.png)

When PHP receives the search query, it creates a new instance of the [SphinxClient](http://sphinxsearch.com/wiki/doku.php?id=php_api_docs) and connects to the Sphinx instance on the server. Filters and sorting modes are also set. Users can filter & sort on price and location. 

When the request is made, Sphinx looks up all the matching items in its index. But Sphinx only returns ID's of items. It doesn't return the title, url or other useful information of these results. So with those ID's in hand, PHP turns to the database for additional information. It makes a query to MariaDB and fetches all the additional information that we want to show on the results page. Now PHP composes a nice page and gives it back to the user.

This proces is actually quite fast. Result pages where rendered within 0.1 to 0.2 seconds. Keep in mind that all these services where running on a VPS with moderate specs, not on dedicated hardware.

## Looking back
Zoekertjesland has been an amazing project for me. I launched it when I was 18 years old. The idea was simple but I quickly stumbled upon a few problems that required some creative problem solving skills. I'm glad that I was able to make everything work. 

Over the course of **2 years**, Zoekertjesland welcomed over **21,500 unique visitors**. They came to find great second hand deals and stayed on the website for more than **5 minutes**. In its lifetime, the search engine processed **40,105 unique search queries**.