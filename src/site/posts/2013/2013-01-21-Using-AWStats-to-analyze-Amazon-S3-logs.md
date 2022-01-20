---
layout: post
title:  Use AWStats to analyze Amazon S3 logs
quote: How to configure AWStats to parse Amazon S3 logs and generate useful reports.
keywords: Amazon S3, Access logs, S3 logs, AWStats, analyze logs
upload_directory: awstats-s3
tags: [AWS]
---

A few weeks ago [I switched from Wordpress to Jekyll]({% link collections.posts, '2013-01-14-moving-from-Wordpress-to-Jekyll' %}). I also started using Amazon S3 to host my blog. I've been pretty happy with my new blog and the performance of S3. There's just one thing missing: access logs.

My previous hosting provider had [Webalizer](http://www.webalizer.org/) installed to analyze the Apache access logs. This is a good way to track bandwidth usage. Additionally I used it to track how often Google indexed my website. S3 has the ability to log accessed files, but no way to analyze them in an efficient way. So I started looking for a solution!

I quickly found [AWStats](http://awstats.sourceforge.net/), a log analyzer similar to Webalizer but with more functionalities. It can take log files of a number of different applications and turns them into useful reports. Integration with Amazon S3 is not included by default, but it's not that hard to set up.

<!--more-->

# Installing & configuring AWStats on Ubuntu Server 12.10
Because AWStats can't be installed on S3, you're going to need a small server for it. I choose a small VPS with Ubuntu Server on it.

Only one command is needed to install AWStats on Ubuntu Server:

<pre>sudo apt-get install awstats</pre>

After the necessary packages are installed, you need to configure AWStats. There is a template configuration located in ``/etc/awstats`` so that's a good starting point. Copy the sample configuration and name it to awstats.yourdomain.com.conf:

<pre>cp /etc/awstats/awstats.conf /etc/awstats/awstats.savjee.be.conf</pre>

Inside the config files, there are a few variables that need to be changed. Find them and modify them so they match your website's setup:

<pre>
LogFile="/home/xavier/s3logs/access.log"
SiteDomain="www.savjee.be"
HostAliases="localhost 127.0.0.1 savjee.be"
</pre>

Most of these items are self-explanatory. ``LogFile`` specifies the location of the access log that AWStats should parse. We'll make this log in a bit. Where you save the log is not important as long as it's accessible by AWStats.

Now we need to "teach" AWStats how to parse the Amazon S3 log files. Luckily, Amazon provides a [Server Access Log Format](http://docs.aws.amazon.com/AmazonS3/latest/dev/LogFormat.html) document detailing the anatomy of a log file. Find the ``LogFormat`` variable in the config file and change it to this:

<pre>LogFormat="%other %extra1 %time1 %host %logname %other %extra2 %url %methodurl %code %other %bytesd %other %other %other %refererquot %uaquot %other"</pre>

There's just one change left. Amazon not only logs what requests have been made to your S3 website, but also logs internal events. So every time you access something in your bucket through the Management Console, it get's logged. These events originate from a private (10.x.x.x) IP range and are worthless for AWStats. To ignore it, we can use ``SkipHosts``. Find it and change it:

<pre>SkipHosts="REGEX[^10.]"</pre>

# Installing & configuring Apache
AWStats needs a web server to serve it's reports. If Apache isn't installed yet, run:
<pre>sudo apt-get install apache2</pre>

In order to access AWStats, we have to tell Apache where it is. Edit the Apache config file in ``/etc/apache2/sites-available/default`` and add these lines:

<pre>
Alias /awstatsclasses "/usr/share/awstats/lib/"
Alias /awstatsicons/ "/usr/share/awstats/icon/"
Alias /awstatscss "/usr/share/doc/awstats/examples/css"
ScriptAlias /awstats/ /usr/lib/cgi-bin/
Options ExecCGI -MultiViews +SymLinksIfOwnerMatch
</pre>

After restarting Apache (``sudo service apache2 reload``) you can go to ``http://yourhost.com/awstats/awstats.pl?config=savjee.be`` and see an empty report.

# Enable logging on S3
Now that the server is prepared you need to enable logging on your S3 bucket. I didn't want to pollute my website's bucket, so I created a new bucket just for logs, logs.savjee.be.

Your log bucket could become pretty big if you don't regularly remove old logs. Fortunately Amazon can take care of this automatically. Go to your log bucket in the Console and open its properties. Under "Lifecycle" you can define when files should be removed from your bucket. Add a new rule, give it a name and set it to remove files that are older than 3 days.

![](/uploads/awstats-s3/lifecycle-rule.png)

Now that the log bucket is set up, go to the properties of your website's bucket and enable logging. Select your log bucket as the target and specify a prefix if you want.

![](/uploads/awstats-s3/logging.png)

That's it for S3. The last thing to do is connecting AWStats with S3.

# Connecting the dots
Our server needs to frequently fetch the log files from our log bucket and process them with AWStats. There are several ways to access S3 buckets from the command line. I choose to use ``s3cmd`` because it's easy to use (I use it to automatically deploy my blog to S3). To install it, run:

<pre>sudo apt-get install s3cmd</pre>

S3cmd needs to know your Amazon security credentials so it can download and store files on S3. To find these credentials, goto [aws.amazon.com](http://aws.amazon.com/), click on "My Account / Console" and select "Security Credentials". Now use s3cmd's built-in configure function and follow the steps:

<pre>sudo su
s3cmd --configure</pre>

*Note: You have to run this command as root because the cron script will run as root. (s3cmd creates a small config file that is saved in the home directory of the current user)*

Now that everything is ready we need a script to automate everything:

{% highlight bash %}
#!/bin/bash
 
# s3-to-AWStat
# Copyright 2013 Xavier Decuyper
# http://www.savjee.be
#
# Permission is hereby granted, free of charge, to any person obtaining
# a copy of this software and associated documentation files (the
# "Software"), to deal in the Software without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
 
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.
 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
# LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
# WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 
##
# CONFIGURATION
##
log_file="/home/xavier/s3logs/script.log" # File to log this scripts output
log_dir="/home/xavier/s3logs/" # Directory to store the S3 log files (access.log is also stored here)
bucket_name="logs.savjee.be" # Name of the bucket where log files are store
config_name="savjee.be" # Name of the AWStats site
 
# Download all log files from S3
echo "=========== Downloading new files from S3 ===========" >> $log_file
s3cmd sync --delete-removed s3://${bucket_name}/ ${log_dir}tmp/ >> $log_file
 
# Merge all logs in access.log
cat ${log_dir}/tmp/* > ${log_dir}access.log
 
# Run AWStats to update reports
echo "=========== Updating AWStats ===========" >> $log_file
sudo /usr/lib/cgi-bin/awstats.pl -config=${config_name} -update >> $log_file
{% endhighlight %}

Put the script on your server and make sure to change the configuration options at the top of the script before you continue. (Contribute to the script: [gist.github.com/4580498](https://gist.github.com/4580498))

# Cron
And finally, add the bash script to your cron so it can run automatically. Run: 

<pre>sudo crontab -e</pre>

And add this line to run the script every 12 hours.

<pre>0 */12 * * * sh /home/xavier/s3-to-AWStat.sh</pre>