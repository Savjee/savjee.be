---
layout: post
title:  Sending Fail2ban (and other) notifications to a Slack chat channel
quote: 
---

A lot of companies these days are using [Slack](https://slack.com/) for their internal communications. And can you blame them? Slack is easy to use and fast as hell (I promise you Slack didn't pay me to <del>say</del> write this!). It was used at the company where I did my internship. I fell in love with Slack's simplicity. I used it every workday to ask simple questions to people who where out of the office, to send files around and so on...

During this internship we held daily stand-up meetings (a must for every Agile team). Sadly though we often forgot this because not everyone came in at the exact same time. To fix this, I configured an [IFTTT](https://ifttt.com/) rule that pushed the message ``STANDUP MEETING`` to our general chat room on Slack when everyone was at the office. Easy and convenient!

<!--more-->

# Take it from here
When my internship ended I was wondering what more I could do with Slack for me personally. A few days went by with me having no idea what I could use it for. However, ideas are everywhere and sometimes hiding behind a corner. Every day I get a bunch of emails from my server. A  mail from [fail2ban](http://www.fail2ban.org/), warning me that someone is trying to brute-force their way into my server and that it stopped them. Or a mail of one of my backup scripts to alert me when something went wrong.

When these things happen I want to know as fast as possible. So there was my idea! I decided to use Slack as a way to get relevant information pushed straight to me. I started by pushing all my server notifications to Slack instead of relying on email!

(There are more platforms out there that can be used to push notifications to you. For example: you could use services like [Pushbullet](https://docs.pushbullet.com/).)

# Using PHP to access the Slack API
Slack allows external developers to use and extend it's service. Through [the Slack API](https://api.slack.com/) you can send messages and create bots. There are different API's but the Webhook API suits my needs perfectly: it doesn't require authentication and is specifically intended to deliver messages to chat channels.

I wrote a simple PHP class to send messages to Slack through [cURL](http://php.net/manual/en/book.curl.php). I know that there are many PHP classes that already do this, but I wanted some experience with cURL in PHP.

So let's get started with my SlackConnect class. To start, you create a new instance of the class and pass it your unique Incoming Webhook URL:

{% highlight php startinline=true %}
$slackClient = new SlackConnect('https://hooks.slack.com/services/XXXXXX/XXXXXXXX/XXXXXXXXXXXXXXX');
{% endhighlight %}

To send a simple message just call the ``setMessage()`` method and finish by calling ``send()``:

{% highlight php startinline=true %}
$slackClient->setMessage('This is the first message with SlackConnect! Wohoooo!');
$slackClient->send();
{% endhighlight %}

Really simple but there's more! Slack also supports sending attachments and fields. Since I wanted to use both, I implemented them into SlackConnect. To add fields call ``addField()``:

{% highlight php startinline=true %}
$slackClient->addField('Short field', 'Short value', true);
$slackClient->addField('Short field 2', 'Short value', true);
$slackClient->addField('Long value', 'This is a longer (multiline) value', false);
$slackClient->send();
{% endhighlight %}

This is what it looks like in Slack:

![](/uploads/fail2ban-slack-notifications/slack-preview.png)

SlackConnect is fairly limited but it gets the job done (I'll be uploading the source code to GitHub later on). To send fail2ban messages to Slack, I created a PHP script that read from ``stdin`` (standard input) and send the input to a chat channel of my choosing. The entire PHP script is incredibly simple and only 3 lines long:

{% highlight php startinline=true %}
// Read fail2ban's notification from stdin
$message = file_get_contents("php://stdin");

// Create a new SlackConnect instance
$slack = new SlackConnect('https://hooks.slack.com/services/XXXXXX/XXXXX/XXXXXXXX');

// Send the fail2ban message!
$slack->sendMessage($message);
{% endhighlight %}

## Configure fail2ban
Now all that's left is telling fail2ban to send all notifications to my PHP script. So I started with creating a new fail2ban action ``slack.conf`` in ``/etc/fail2ban/action.d/`` with these contents:

<pre>
[Definition]

# Option:  actionstart
# Notes.:  command executed once at the start of Fail2Ban.
# Values:  CMD
#
actionstart = printf %%b "The jail <name> has been started successfully."|php /vps.savjee.be/slack2ban/send.php

# Option:  actionstop
# Notes.:  command executed once at the end of Fail2Ban
# Values:  CMD
#
actionstop = printf %%b "The jail <name> has been stopped."|php /vps.savjee.be/slack2ban/send.php

# Option:  actioncheck
# Notes.:  command executed once before each actionban command
# Values:  CMD
#
actioncheck =

# Option:  actionban
# Notes.:  command executed when banning an IP. Take care that the
#          command is executed with Fail2Ban user rights.
# Tags:    See jail.conf(5) man page
# Values:  CMD
#
actionban = printf %%b "The IP <ip> has just been banned by Fail2Ban after
            <failures> attempts against <name>"|php /vps.savjee.be/slack2ban/send.php


# Option:  actionunban
# Notes.:  command executed when unbanning an IP. Take care that the
#          command is executed with Fail2Ban user rights.
# Tags:    See jail.conf(5) man page
# Values:  CMD
#
actionunban =

[Init]

# Default name of the chain
#
name = default

# Destination/Addressee of the mail
#
dest = root
</pre>

It might look like a lot of code but it's actually a copy of the default ``sendmail`` action. If you look closely you'll notice that I've only changed the ``actionban`` variables. I pipe the outputs to my own PHP script.

I then configured fail2ban to use the Slack action whenever
someone gets banned. To do this, edit the general jail config file located at ``/etc/fail2ban/jail.conf`` and add a new variable called ``action_slack``:

<pre>
# Ban & Slack!
action_slack = %(banaction)s[name=%(__name__)s, port="%(port)s", protocol="%(protocol)s", chain="%(chain)s"]
              slack[name=%(__name__)s, dest="%(destemail)s", protocol="%(protocol)s", chain="%(chain)s", sendername="%(sendername)s"]
</pre>

Finally, I configured fail2ban to use my Slack action. Simply overwrite the ``action`` variable located in the same config file with ``action_slack``:

<pre>
action = %(action_slack)s
</pre>

Done! Restart fail2ban to apply the changes. Shortly after the restart you should see the "jail has been started successfully" notification in Slack.

# What I use it for
Right now I'm using my SlackConnect class for pushing a variety of notifications to Slack:

  * I use it to keep track of all my server notifications. This includes fail2ban notifications and the output of my backup scripts. Both of these get pushed to separate channels on Slack.

  * I wrote a simple PHP script to keep track of packages that are shipped with [Bpost](https://www.bpost.be/) (the Belgian postal company). Every time one of my packages moves a bit closer to me, I get a notification on Slack.

  * Finally I use it to keep track of daily deals on [iBood](http://www.ibood.com). This website offers a few deals every day. Each product that they sell is greatly reduced in price. So it's nice to keep an eye on this through Slack.

Each of these scripts push their messages to a separate channel on my Slack account. If I'm tired of getting notifications from one of these, I simple change the notification setting of that channel to ``Nothing``. That way I don't get a notification on my phone and yet all messages are still being sent to Slack so I can view them if I wanted to.

![](/uploads/fail2ban-slack-notifications/slack-notifications-settings.png)

# Wrap-up
As you can see, Slack is an amazing tool. Not only for team collaboration but also for individual use. And it gets even better. When you use an Android device and own a smartwatch, you'll get your notifications pushed straight to your wrist!

![](/uploads/fail2ban-slack-notifications/slack-android-wear.png)
