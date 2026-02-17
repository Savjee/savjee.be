---
layout: post
title:  Building a dynamic heart of profile pictures
description: "Build a dynamic heart animation with donor profile pictures using PHP, CSS3, and JavaScript. Complete guide for donation websites with visual rewards."
quote:
keywords: heart, profile pictures, facebook, PHP, animate, CSS3, JavaScript
thumbnail: true
upload_directory: /uploads/dynamic-heart
---

A few months back I was contacted by a non-profit organisation for building an online donation system. They found me after reading a news article about [the meta search engine]({% link collections.posts, '2014-05-08-Building-metasearch-engine' %}) that I developed. I happily accepted their request and met with the founder shortly afterwards. The idea was simple: set up a website where people can see what the organisation does and where they can donate. After donating a user should be "rewarded" with something.

We end up building a "beating" heart surrounded by profile pictures of donators. After each donation, a user is "rewarded" with the possibility to include his picture in the heart. In this post I'll walk you through the process of building the dynamic heart.

<!--more-->

Here's a sneak peak of what the result looks like:

![Preview of the dynamic heart](/uploads/dynamic-heart/dynamicHeart.gif)

## The organisation
Let me start by quickly describing the organisation. The NPO is called VZW Bescherm kinderen and was founded to protect children when parents are having severe issue's. The organisation aims to prevent family tragedies. They want to be able to take children away from dangerous situations and put them in safe house. Currently there is no organisation or law in Belgium that protects children from dangerous family situations.

## The problem
The idea was to create a website where people can donate money for the organisation. However, the problem we faced was: what do we give people in return for their donation? Donators should feel good about their donation and receive a little gift for it. After all, they are helping to protect children! 

After a bit of brainstorming we came up with two idea's:

* Give people the ability to share a personal badge indicating that they support the organisation.
* Allow people to add their Facebook profile picture to the website.

## Finding a solution
The first idea is easy to implement but the second one is harder to crack. We discussed a number of different ways to show profile pictures on the website. At first we simply filled a rectangle with profile pictures. However, that's not very nice to look at. It doesn't warm your heart.

My girlfriend suggested to fill up an actual heart with profile pictures. Not a bad idea! Our first prototype looked like this:

![First prototype of the dynamic heart](/uploads/dynamic-heart/hartje_prototype1.png)

Much better! It tells you that people in the heart care for the cause. This first prototype shows 116 profile pictures. That sounds like a lot but we wanted to show more pictures at once. We brainstormed again and figured out an even better way: let the pictures surround a heart instead of making one! We improved our prototype and this is the result:

![First prototype of the dynamic heart](/uploads/dynamic-heart/hartjeLive.png)

This version can show 271 profile pictures at once. Great! We also freed up some space inside the heart to show a little message with a donate button.

## Implementing the heart
Let's move on to the technical part of this heart. I started working on implementing the heart in PHP. I figured that an multidimensional array would be the best way to represent this heart. I needed to represent two types of HTML blocks in the array: empty blocks and blocks that show a profile picture.

Here is the array that I use to represent the structure of the heart (if you look closely at the zero's you can actually see the heart):

{% highlight php startinline=true %}
$structure = array(
        array(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
        array(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
        array(1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1),
        array(1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1),
        array(1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1),
        array(1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1),
        array(1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1),
        array(1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1),
        array(1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1),
        array(1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1),
        array(1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
        array(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0 ,1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
        array(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
        array(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
        array(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1)
);
{% endhighlight %}

Next step is to actually generate some HTML code. I start by retrieving the Facebook IDs for 271 profile pictures from a MySQL database. After that a simple loop goes over every element in the heart-array and produces a ``div`` based on the value in the array. A value of ``1`` becomes a block with a profile picture, a value of ``0`` becomes an empty slot.

{% highlight php startinline=true %}
public function generateHTMLCode(){
  $profilePictures = $this->getProfilePictures();
  
  $output = '';

  for($i = 0; $i < count($this->structure); $i++){
    for($ii = 0; $ii < count($this->structure[$i]); $ii++){
      $style = '';
      
      if($this->structure[$i][$ii] == 1){
        $style = 'background-image: url(http://graph.facebook.com/v2.1/'. array_shift($profilePictures) . '/picture);';
      }
      
      $output .= '<div class="profilePicture" style="'. $style .'"></div>';
    }
  }
  
  return $output;
}
{% endhighlight %}

One question you might have is: how well does this perform? Loading 271 profile pictures from Facebook sounds like a bad idea. Yet, it doesn't negatively impact performance all that much. The page gets rendered completely and is not blocked by loading profile pictures. It does take a few seconds to load the entire heart for the first time. Afterwards, the browser cache greatly improves render times.

## Fetching Facebook profile IDs
The array ``$profilePictures`` in the code block above contains a list of Facebook profile IDs of donators. If a visitor completes the donation process he can choose to login with Facebook and submit his profile picture to the heart.

To achieve this, I used the [Facebook SDK for JavaScript](https://developers.facebook.com/docs/javascript). The ``FB.login()`` method is used to prompt the user to login with Facebook. If a user accepts this request, we receive some information of that user. This includes the ID of his Facebook profile. That value is stored in the database so it is included next time the heart is being rendered. Here's the code we currently use to fetch a user ID:

{% highlight js %}
FB.login(function(){
  FB.api(
    "/me",
    function (response) {
      if (response && !response.error) {
        console.log("The profile ID is: " + response.id);
      }
    }
  )
});
{% endhighlight %}

## Animating the profile pictures
We were very satisfied with the results so far. However, I wanted a way to make the heart look "alive" and dynamic. At first I wanted to make it beat like a real heart does, but that creates a very weird effect. Instead we chose to enlarge one profile picture in the heart every few seconds. It makes the heart dynamic and highlights a supporter of the cause.

Here's the CSS3 code I used for animating the profile pictures (I removed the vendor prefixes): 
{% highlight css %}
.profilePicture{
	transition: all .3s ease-in-out;
}
.profilePicture.animate{
	transform: scale(3);
}
{% endhighlight %}

Now all that's left is to add the ``.animate`` class to a random image at a fixed interval. Here's the jQuery code that I implemented to accomplish this (sorry for choosing jQuery...):

{% highlight js %}
// Highlight a new profile picture every second
$(document).ready(function () {
	setInterval(function () {
		// Remove the animate class from previous highlighted profile picture
		$('.animate').removeClass('animate');

		// Get a random profile picture
		var randomPicture = $(".profilePicture").get().sort(function () {
			return Math.round(Math.random()) - 0.5;
		}).slice(0, 1);

		// Add animate class to the new highlighted profile picture
		$(randomPicture).addClass('animate');
	}, 1000);
});
{% endhighlight %}

## Result
The result looks quite good (if I say so myself). In case you missed it at the start of the post, it looks like this:

![Preview of the dynamic heart](/uploads/dynamic-heart/dynamicHeart.gif)