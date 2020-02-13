---
layout: post
title: Meal planning with Trello and AWS Lambda
quote: 
tags: [AWS]
---

When my girlfriend and I moved in together, we decided to sit down each Saturday and plan ahead what we we're going to eat the following week. We used to do this with pen and paper but as a few weeks passed I thought: why are we doing this the old school way? Don't get me wrong: pen and paper get the job done efficiently but it doesn't allow us to check what's for dinner when we aren't home.

So a couple of weeks ago I decided to make a digital version of our weekly meal planner. In this post I'll show you how we use Trello and AWS Lambda to create an semi-automated weekly meal planner.

<!--more-->

# The original
Here is a picture of our original and analog week menu:

![](/uploads/meal-planning-trello-lambda/old-meal-planner.jpg)

It has the days of the week on the left and the meals we're going to eat on the right. Can't get any simpler than this! Now on to our digital solution!

# Enter Trello
I quickly thought about using Trello as our new week menu planner. I started by creating a new board and added a "Backlog" column. The backlog column is an idea bin: it comes in handy when we don't know what we want to eat the following week. If that occurs, we browse through the list and just name the things we would like to eat again. 

We then created a card for each meal that we can prepare and put it in our idea bin. For some meals we added a description so that we know exactly how we made something or what ingredients we need.

Next I created 7 columns: one for each day of the week. This served as our first digital meal planner. Every Saturday we would reset the board by dragging all the cards back to the backlog. Afterwards we would plan the next week and drag new cards from the backlog to fill the other columns. Simple!

![](/uploads/meal-planning-trello-lambda/new-meal-planner.jpg)

There were however two "pain points" I wanted to address (and automate):

* Every Saturday we had to **drag all the cards back to the backlog** column. It's a silly, repetitive task and I don't like that!
* The weekday columns are static. I don't want to scroll all the way to the right when it's Sunday to see what's for dinner. Instead, **the columns should be re-ordered so that the current day is always the first column** after the backlog.

Luckily for me, Trello has a very extensive API that I could use to fix these annoyances.

# Automating it with AWS Lambda
In the past I would have created a simple PHP script, upload it to my server and set up a cronjob for it to run periodically. But lately I've been using AWS Lambda for nearly everything. It's just nicer: I don't have to worry about my server's uptime, security, configuration or any other stuff.

I started by creating a Lambda function that reshuffles the columns in the correct order, starting with the current day. Here is a snippet of the Lambda function (full source is available on Github, see the bottom of this post):

{% highlight javascript %}
// Ordered based on how Date.getDay() works in Javascript
var DAYS_OF_WEEK = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];

var date = new Date();
var currentDay = DAYS_OF_WEEK[date.getDay()];

// Let's sort the array
let foundCurrentDayInArray = false;

while (foundCurrentDayInArray == false)
{
	// If the first day of the week is the current one, yay!
	if (DAYS_OF_WEEK[0] == currentDay) {
		foundCurrentDayInArray = true;
	} else {
		DAYS_OF_WEEK.push(DAYS_OF_WEEK.shift());
	}
}
{% endhighlight %}


This code keeps running until the array ``DAYS_OF_WEEK`` starts with the present day. If the array does not start with the current day, it pop's the first element of the array and places it at the end of it.

After using this for a couple of weeks I extended that Lambda function so that it would reset our board as well. So every Saturday, this piece of code moves all the cards back to the backlog so that we can start planning our next week:

{% highlight javascript %}
getAllCardsOnTrello(function (cards) {
	cards.forEach(function (card) {
		resetCardPosition(card, backLogColumn);
	});
});
{% endhighlight %}

# Creating a scheduled task
After creating the Lambda function, I needed a way to trigger it each day (shortly after midnight) so that it could update our board. Luckily Amazon offers Scheduled Events, a service powered by CloudWatch. To enable it, follow these steps:

1. Go to the [CloudWatch console](https://console.aws.amazon.com/cloudwatch/)
2. Open up "Rules" and create a new rule

    ![](/uploads/meal-planning-trello-lambda/cloudwatch-schedule-1.jpg)

3. In the "Schedule" section you can write a cron-like expression. In this case I've used the expression ``5 0 * * ? *`` which runs my Lambda functions every day, 5 minutes after midnight. In the "Targets" section I selected my Lambda function and clicked "Configure details".

    ![](/uploads/meal-planning-trello-lambda/cloudwatch-schedule-2.jpg)

4. The final step is to give your schedule a name. I named mine ``trello-weekmenu-schedule``. Finally I clicked "Create rule" to finish.

    ![](/uploads/meal-planning-trello-lambda/cloudwatch-schedule-3.jpg)

The schedule is now displayed in the CloudWatch console:
![](/uploads/meal-planning-trello-lambda/cloudwatch-schedule-4.jpg)

That's it! CloudWatch now triggers my Lambda function every day at 5 minutes past midnight. The function then reorganizes my board and gets it ready for the day.

# Wrapping up
That's it for this post! I'm very happy that we started to use Trello for our weekly meal planning. It allows me to check what's for dinner when I'm on my way home. 

There is however a lot of things we can improve or extend. Here are some idea's (on the top of my head):

* Adding pictures of our meals
* Add more detailed descriptions (recipes, required ingredients, ...)
* Display the week menu on a small screen with a Raspberry Pi (and hang it on our fridge?)
* Automatically generate a grocery list based on what we're eating the next week
* ...

Let me know in the comments how you would improve our setup!

Also, if you want this for yourself: the source code of the Lambda function is [available on Github](https://github.com/Savjee/trello-weekmenu-lambda). Please be gentle, I hacked this together on a train ride to work. As always: feel free to improve the code, submit a pull request, create an issue, ...
