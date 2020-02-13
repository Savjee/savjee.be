---
layout: post
title:  Moving from Wordpress to Jekyll
quote: A few months ago I started a blog using Wordpress. Unsatisfied with the performance, I moved my blog over to Jekyll, a blog-aware static site generator.
keywords: Wordpress to Jekyll, Jekyll blog, high performance, static website, static blog
upload_directory: wordpress-to-jekyll
tags: [Jekyll]
---

A few months ago I had the idea to start blogging. So what do you do when you want to blog? You setup a blog script on your webserver! I decided to go with Wordpress since it's so popular and easy to use. I did a clean install of Wordpress on my local machine and gave it a spin!

For a moment I was really impressed. In a matter of minutes you can set up a blog and start writing. Add some photos, tweak the theme, add a menu and you're ready. Really easy.

The downside for this flexibility is performance and efficiency. Wordpress made my site incredibly slow (I have a cheap web host). My old website loaded under a second and Wordpress took 2 to 3 seconds! That's unacceptable so I started to look for alternatives.

<!--more-->

Before I switched to Wordpress I made every single web page by hand in TextMate. It seems like a lot of work but I only had a few pages. It gave me complete control over my website. Every page could be entirely different. I choose where to include a big script and where not to. In Wordpress you don't have this flexibility!

# The solution
Luckily for me, I found the perfect solution: "a blog-aware, static site generator" called [Jekyll](https://github.com/mojombo/jekyll).

It's the best of both worlds! It meant that I could keep my blog AND my static files. But why would you prefer a static website?

* Static websites are **portable**, they don't rely on anything. No need for a database or a server-size scripting language like PHP.
* No server-side scripts behind your website means that it's very **secure**. A static website is harder to compromise because no code is executed.
* **Performance** wise, you can't beat a static website. Requests will be served as fast as your web server can handle. No CPU intensive scripts or database queries that can bring performance down.

The only downside to Jekyll is that it's not very user-friendly. It doesn't have a nice web interface where you can write posts. If you're not comfortable with HTML, CSS and a terminal, Jekyll is nothing for you.

# Installing Jekyll
Before you can start blogging with Jekyll you have to install it first. The GitHub wiki of Jekyll provides [detailed installation instructions](https://github.com/mojombo/jekyll/wiki/install), so I'd suggest you take a look. 

On OS X you have to update RubyGems first:
{% highlight bash %}
sudo gem update --system
{% endhighlight %}

Depending on your configuration, the command should return something like this:

<pre>
Updating RubyGems
Updating rubygems-update
Successfully installed rubygems-update-1.8.24
Updating RubyGems to 1.8.24
Installing RubyGems 1.8.24
RubyGems 1.8.24 installed
</pre>

After updating RubyGems, go ahead and install Jekyll:
{% highlight bash %}
sudo gem install jekyll
{% endhighlight %}

The installation went fine on my Hackintosh but failed on my Macbook:
<pre>
Building native extensions.  This could take a while...
ERROR: Error installing jekyll:
ERROR: Failed to build gem native extension.
</pre>

I have no idea why it failed on my Macbook. Both computers have the latest version of Mountain Lion with Xcode installed. Anyway, **to fix this I installed the "Command Line Tools (OS X Mountain Lion) for Xcode"**. You can download it from [Apple's website](https://developer.apple.com/downloads/index.action). After the installation, Jekyll installed without problems.

If you want to use code highlighting on your blog, you should also install RDiscount:

{% highlight bash %}
sudo gem install rdiscount
{% endhighlight %}

# The structure of a Jekyll site
Now that Jekyll is installed you can start setting up your website. The file structure of your website should look something like this:

<pre>
.
├── _config.yml
├── _layouts
│   ├── default.html
│   └── post.html
├── _plugins
│   ├── CssMinify.rb
│   ├── preview.rb
│   └── url_encode.rb
├── _posts
│   ├── 2012-10-04-Creating-one-WiFi-network-with-multiple-access-points.md
│   ├── 2012-12-28-building-a-hackintosh.md
│   ├── 2012-12-29-moving-from-Wordpress-to-Jekyll.md
├── _site
├── assets
│   ├── scripts.js
│   └── style.css
├── contact.html
├── favicon.ico
├── index.html
└── tshark.html
</pre>

Your website's theme goes into ``_layouts/``, Jekyll plugins go into ``_plugins/`` and your posts go into ``_posts/``. Pretty straight forward!

The best way to start a Jekyll blog is to look at existing blogs. The official wiki has [a huge list](https://github.com/mojombo/jekyll/wiki/Sites) of websites that use Jekyll and have published the source code. (At some point in the future I'll upload my blog to GitHub as well. Just not right now.)

# Permalinks
When moving from Wordpress to Jekyll you'll run into another problem: permalinks. If you change your URL structure, you'll break every link to your blog. Luckily Jekyll allows you to set the structure of links that it generates. I added this to my ``_config.yml`` file (If you don't have the config file yet, just create it and add this line):
<pre>
permalink: /:year/:month/:title/
</pre>

This makes my old Wordpress URL's compatible with the new Jekyll URL's. Keep in mind that to achieve this, Jekyll generates a lot of folders with just one ``index.html`` file inside them:
<pre>
.
├── 2012
│   ├── 10
│   │   └── creating-one-WiFi-network-with-multiple-access-points
│   │       └── index.html
│   └── 12
│       ├── building-a-hackintosh
│       │   └── index.html
│       └── moving-from-Wordpress-to-Jekyll
│           └── index.html
</pre>

If you don't like this you can use a ``.htaccess`` file to rewrite the Wordpress URLs to Jekyll URLs. (Sorry, no additional details. I don't use it myself since this website is hosted on Amazon S3 and htaccess files are not supported)

# Writing blog posts
Blog posts in Jekyll are written in [Markdown](http://daringfireball.net/projects/markdown/), "an easy-to-read and easy-to-write plain text format". The Markdown syntax is also easy to learn.

To compose Markdown files you just need a basic text editor. If you are a developer, you can use your code editor. Or you could use an editor that is designed with Markdown in mind, like iA Writer.

iA Writer is a dead simple text editor for Markdown documents. It let's you focus on writing and eliminates distractions. There are versions for the Mac, iPhone and iPad. It's not free though.

Remember to save all your posts in the ``_posts/`` folder. Simply run ``Jekyll`` to regenerate your website with your new post.

# Compressing CSS while building site
To improve performance of the website even further I wanted to compress CSS code. To achieve this, I added the plugin [jekyll-cssminify](https://github.com/donaldducky/jekyll-cssminify). Simply download the ``CssMinify.rb`` file and place it in the ``_plugins`` folder of your Jekyll site.

CssMinify has a few dependencies that have to be installed before you can use it:

{% highlight bash %}
sudo gem install juicer
juicer install jslint
juicer install yui_compressor
{% endhighlight %}

That's it! Everytime Jekyll generates my website, the stylesheets are compressed. The last thing you need to do is to include the minified CSS stylesheet in your template:

{% highlight html %}
<link rel="stylesheet" type="text/css" href="{ % minified_css_file %}">
{% endhighlight %}

*Note: be sure to remove the space between { and %. I added this because Jekyll replaced it with the name of my compressed CSS file.*


# Future & conclusion
To increase the uptime and performance of my blog [I moved it to Amazon S3]({% post_url 2013-02-01-howto-host-jekyll-blog-on-amazon-s3 %}). I can automatically deploy my blog to S3 in a matter of seconds.

Moving your blog over to Jekyll can be a lot of work depending on the size of your blog. But if you're comfortable with a terminal and want a high performance blog it's definitely worth it!