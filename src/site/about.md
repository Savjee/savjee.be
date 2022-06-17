---
layout: page
title: About me
---

{% assign birthday="1994-04-07" | date: "%s" %}
{% assign age="now" | date: "%s" | minus: birthday | divided_by: 3600 | divided_by: 24 | divided_by: 365 | floor %}

By looking at this website and my content you probably think that I’m a developer and a passionate geek. Spot on! Here are some facts that you probably don't know about me: I’m {{age}} years old and I live in a country that is so tiny you might not even spot it on a map!

Besides this blog, I also have [a YouTube channel](https://www.youtube.com/channel/UCnxrdFPXJMeHru_b4Q_vTPQ) and I’ve created [a few e-learning courses](/courses). One of my biggest passions is taking complex topics and simply explaining them. I love doing extensive research and continuously rewrite my posts or video scripts until they make sense. It’s a messy and unstructured process but when I’m finally done, it gives me satisfaction knowing that I’ve helped people to understand new topics.

I hope that you can feel all my passion when reading my blog posts or watching my videos. A lot of hard work has gone into them!

But enough about me! Let’s talk about you. What is your story? What drives you? What gets you up in the morning? Is it the Simply Explained content or something else? 

Feel free to reach out to me on Twitter ([@Savjee](https://twitter.com/Savjee)) and let me know. I'd love hearing from you!
