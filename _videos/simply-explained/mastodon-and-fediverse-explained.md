---
layout: video
collection: videos
title: Mastodon & The Fediverse Explained
videoId: S57uhCQBEk0
order: 23
series: Simply explained
uploadDate: 2019-03-05
---

**Summary** | 
Mastodon is a "federated" social network that works like Twitter. It puts the control of data into the user's hands, not in a single corporation.

Music used in this video: [Intrics Leo by Yan Terrien](http://freemusicarchive.org/music/Yan_Terrien/Adelor_Dramax/04_Intrics_Leo)

---

## Intro
In recent years, social media networks have grown exponentially, with Facebook having a massive 2.3 billion active monthly users. However platforms like Twitter and Facebook have also faced a lot of controversy and without going to much into details I want to highlight just one in this video: centralisation.


## Problem
When we’re using Facebook or Twitter, we are effectively trusting a single company with all of our data. And not just that. They also control what posts are allowed on their platforms. If yours don’t follow the rules, your account can be shut down and there is nothing you can do about that.


## Solution: Mastodon
So, how can we solve this? Well we could make social media more decentralized. And that brings us to the main topic of the video: Mastodon. An open source project that wants to put social networking back into your hands. At least that’s what the tagline says.

In a nutshell, Mastodon is basically like Twitter. Tweets are called “toots” and they can be up to 500 characters long, versus only 280. You can also follow people you find interesting and retweet or “boost” toots that you like.

So how’s it different then? For starters, Mastodon isn’t controlled by one company. It’s an open project and everyone can grab a copy of the code and set up their own Mastodon server, also referred to as an instance. What’s more, the owner of an instance is often a member of the community and they define the rules for their server. 

If those are in conflict with what you want to post, you simply find another server to register your account. This is a choice you don’t have with traditional social networks.

And the best part is that each Mastodon server can communicate with the others. Meaning if you signed up for one instance, you’ll still be able to interact with users on another one.

## Federation is like email
This model for decentralization is called federated and it can be best compared to email. There are many email providers out there like Gmail, Outlook and Yahoo Mail. I can sign up for Gmail while you can sign up for Outlook and yet we’re still able to send each other emails.

That’s because email servers speak the same language: they all use a standard protocol to communicate. 

## ActivityPub
The same is true for Mastodon servers, they communicate with each other using the ActivityPub. It’s a standard protocol that defines how a server should handle new user posts and how they can be interacted with like sharing, replying or liking posts.

But ActivityPub is not limited to Mastodon. Other applications can also implement it and that’s where the magic happens! Let me give a concrete example: PeerTube, a website similar to YouTube, also implements ActivityPub and because of that, Mastodon users can follow a PeerTube user. If that user posts a new video, it will pop up on the feed of the Mastodon user.

How cool is that? Any platform or application that implements ActivityPub becomes a part of a massive social network. Imagine being able to use your Facebook account to follow your friends on other platforms like Twitter and YouTube, without needing an account there.

This big social network is also called the Fediverse and it already has a ton of services. For microblogging you can use Mastodon or Friendica. For video hosting there is PeerTube and Funkwhale. For image hosting you can use PixelFed and for regular blogging you can use Plume or Write.as. 

## Networking
You could even say that the Fediverse prevents lock-in. One of the reasons why Facebook has gotten so big is because people have to join it before they can participate. And once you’re in, Facebook tries to keep you in. 

They intentionally make their platform closed but in the Fediverse the opposite is happening. More platforms are being built on top of the ActivityPub protocol because that means they can see and interact with all of the content out there.

## Community
Sounds great right? I was so convinced that I decided to sign up for Mastodon. And straight away I send out a “toot” asking people what I should cover when making a video about Mastodon.

A few short minutes later, without any followers, I received useful replies. And I don’t mean that sarcastically. People were keen to point out that Mastodon doesn’t do ads and that it has more advanced features compared to Twitter. There is for instance a nifty spoiler alert system.

One user even asked if my final video would be uploaded to PeerTube and another pointed out that it’s not just Mastodon, and that I should also mention the entire Fediverse. Which, I did do.

## Downsides
Alright, by now you’re probably thinking: stop your sales talk already. Nothing can be this good! And yes, there are some drawbacks. For starters: money. Running a Mastodon or any other instance comes with the costs of running servers and maintaining them.

To recover that, most instance owners dependent on donations from their users. Selling ads is not possible. So before ActivityPub can really take off, we might have to look into this problem. Otherwise we could see a lot of instances being born, but a lot of them might also die quickly because of a lack of funding. 

The second possible downside is adoption. The Fediverse is, in my opinion, a revolutionary idea. One that could interconnect many social services together. But it’s all worth nothing if it’s not being used. 

Over the years there have been quite a few attempts at decentralizing social media with projects like GNU social or Diaspora. All of which had limited success. They weren’t build on the ActivityPub protocol and that might have limited their successes.

One this is for sure though, Mastodon is picking up steam. Fun side effect: it’s very popular amongst Japanese people. Cultural differences make them feel unwelcome on Twitter and so many Mastodon instances are created by Japanese people, for Japanese people. Really cool!

But back on topic: currently there are over 6500 Mastodon instances worldwide, who serve a total of 2 million users. That’s nothing compared to giants like Twitter and Facebook but it does indicate that there is an interest for something else. Something better and more community driven.

## Conclusion
So that was it for this video. Would you consider signing up for Mastodon or another platform on the Fediverse? 
Let me know your thoughts in the comments below and follow me on [Mastodon](https://mstdn.io/@savjee).

---

# Sources
This video wouldn't be possible without the work of others. Here are the sources I've used during my research & script writing:

{% bibtex %}

@techreport{webber2017activitypub,
  title={ActivityPub},
  author={Webber, CA and Tallon, Jessica and Shepherd, O and Guy, Amy and Prodromou, Evan},
  year={2017},
  institution={Tech. rep. https://www. w3. org/TR/activitypub/. Accessed: 8.8. 2017. W3C},
  url={https://img.sauf.ca/pictures/2018-04-04/d538860d810120584f5e1dffa7594e58.pdf}
}

@inproceedings{zignani2018follow,
  title={Follow the “Mastodon”: Structure and Evolution of a Decentralized Online Social Network},
  author={Zignani, Matteo and Gaito, Sabrina and Rossi, Gian Paolo},
  booktitle={Twelfth International AAAI Conference on Web and Social Media},
  url={https://www.aaai.org/ocs/index.php/ICWSM/ICWSM18/paper/view/17862/17047},
  year={2018}
}

@online{src,
    title={An Introduction to the Federated Social Network},
    url={https://www.eff.org/deeplinks/2011/03/introduction-distributed-social-network},
    author={Richard Esguerra},
    organization={Electronic Frontier Foundation},
    year={2011},
    month={03},
    day={21}
}

@online{src,
    title={What is ActivityPub, and how will it change the internet?},
    url={https://jeremydormitzer.com/blog/what-is-activitypub-and-how-will-it-change-the-internet/},
    author={Jeremy Dormitzer},
    year={2018},
    month={09},
    day={15}
}

@online{src,
    title={What I wish I knew before joining Mastodon},
    url={https://hackernoon.com/what-i-wish-i-knew-before-joining-mastodon-7a17e7f12a2b},
    author={Qina Liu},
    organization={Hackernoon},
    year={2017},
    month={4},
    day={9}
}

@online{src,
    title={What is Mastodon and why is it better than Twitter},
    url={https://nolanlawson.com/2017/10/23/what-is-mastodon-and-why-is-it-better-than-twitter/},
    author={Nolan Lawson},
    year={2017},
    month={10},
    day={23}
}

@online{src,
    title={Company Info},
    url={https://newsroom.fb.com/company-info/},
    organization={Facebook},
}

@online{src,
    title={Mastodon WTF timeline},
    url={https://ansuz.sooke.bc.ca/entry/335},
    author={Matthew Skala},
    year={2017},
    month={4},
    day={23}
}

@online{src,
    title={Number of monthly active Facebook users worldwide},
    url={https://www.statista.com/statistics/264810/number-of-monthly-active-facebook-users-worldwide/},
    organization={Statista},
    year={2019},
    month={1},
}

@online{src,
    title={Fediverse},
    url={https://en.wikipedia.org/wiki/Fediverse},
    organization={Wikipedia},
}

@online{src,
    title={Mastodon (software)},
    url={https://en.wikipedia.org/wiki/Mastodon_(software)},
    organization={Wikipedia},
}

@online{src,
    title={Mastodon instances},
    url={https://mnm.social/instances/},
    organization={Wikipedia},
}
{% endbibtex %}