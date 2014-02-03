---
layout: post
title: TixClock clone in Javascript
quote: After struggling to get my hands on a Tix clock, I decided to code my own Tix clock with HTML and Javascript.
---

Some time ago I discovered [Chris Pirillo on Youtube](http://www.youtube.com/lockergnome) and I wondered what he had above his desk. Some sort of LED lights in different colors that change every now and then. I thought it was a very cool accessory but rather pointless.

But! I soon discovered that these LED lights where in fact [Tix clocks](http://www.amazon.com/TIX-Color-Code-Clock-Silver/dp/B000FIB9RK?tag=ga21-20)! They weren't random LED lights that turned on once in a while.

I desperately wanted one but found it hard to get my hands on one! So I decided to make my own Tix clock with HTML and Javascript. And to finish it off, I made a screensaver of it for my Macs!

<!--more-->

# Tix?
Before I began implementing a Tix clock, I needed to understand how they worked and how they represent time.

<img src='/uploads/tixclock/howto-read.gif'>

This image is really all you need to learn how to read a Tix clock. Simply **count** the amount of LEDs turned on in each segment and you know the time!

# HTML structure
After I cleared up my confusion on how to read Tix clocks, I started working on the HTML skeleton:

{% highlight html %}
<div id='tixClock'>
	<div id='group_0'>
		<div id='0_0'> </div>
		<div id='0_1'> </div>
		<div id='0_2'> </div>
	</div>

	<div id='group_1'>
		<div id='1_0' class='active'> </div>
		<div id='1_1' class='active'> </div>
		<div id='1_2' class='active'> </div>

		<div id='1_3'> </div>
		<div id='1_4' class='active'> </div>
		<div id='1_5'> </div>

		<div id='1_6'> </div>
		<div id='1_7' class='active'> </div>
		<div id='1_8'> </div>
	</div>
	...	
</div>
{% endhighlight %}

I created a div for every LED and gave it a unique ID. I used the following ID format: ``[Group number of LED]_[Number of LED in that group]``. So the first LED in the first group get's the ID ``0_0``.

# CSS
A Tix clock is all about color, so I added CSS to mimic the looks of a real clock. I used a black background and standard HTML color names for the red, green and blue LEDs:

{% highlight css %}
#group_0 .active, #group_3 .active{
	background-color: red !important;
}

#group_1 .active{
	background-color: green !important;
}

#group_2 .active{
	background-color: blue !important;
}
{% endhighlight %}

Let's go crazy and throw some CSS3 in here as well! When you look at an active LED of a Tix clock you notice that the light is not spread evenly. When a LED is turned on, the square has a bright spot in the middle and a more diffused light at the edges. So to make it look somewhat the same I added a box-shadow:

{% highlight css %}
.active{
	box-shadow:inset 0px 0px 40px #000;
}
{% endhighlight %}

It's silly I know. But it makes my Tix clock look much more like a real one! I'm not a good designer but this does the trick!

# Javascript
After doing the design I started working on the code that would make my Tix clock tick! The Javascript code I wrote is very simple and has no dependencies. I'm not going to copy-paste all the code in this post but instead I'm going to give an overview of the functions I wrote:

* ``random_number()`` to generate a random number between two values (used to randomly pick a LED to turn on)
* ``inArray()`` searches an array for a given value
* ``pad()`` to add leading zero's to a number
* ``colorLeds()`` to 'turn on' a given amount of a LED's in a specific group
* ``clearLeds()`` to turn off every LED
* And finally ``updateTime()`` to update the entire Tix clock!

A real Tix clock updates every 4 seconds so mine does that too. This piece of code triggers everything that's required to show the time:

{% highlight js %}
setInterval(function(){
	clearLeds();
	updateTime();
}, 4000);
{% endhighlight %}


# Screensaver
After successfully implementing my own Tix clock I wanted to use it as a screensaver for my Macs!

Sadly I have no knowledge of how to write a screensaver, how to work with Xcode or how to program Objective-C. Luckily though I found [WebSaver on GitHub](https://github.com/tlrobinson/WebSaver) and within a few minutes I had a working Tix clock screensaver for OS X!

Here's a picture of the screensaver running on my [Hackintosh]({% post_url 2012-12-28-building-a-hackintosh %}):

<img src='/uploads/tixclock/hackintosh-screensaver.jpg'>

# Demo, Download & Source

<img src='/uploads/tixclock/screenshot.png'>

* See my Tix clock in action [right here](/uploads/tixclock/tixclock.html)!

* Download the Mac OS X Tix clock screensaver [here](/uploads/tixclock/Tix.saver.zip). (To install simply extract and double click Tix.saver)

* (A Windows screensaver isn't available yet. I didn't find anything similar to WebSaver for Windows. If you have suggestions: let me know! I'm dying to get this running on my netbook!)

* Source code is available on [Github](https://github.com/Savjee/jsTixClock)