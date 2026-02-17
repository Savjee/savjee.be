---
layout: post
title: Google Sheets as a backend for your applications
description: "Use Google Sheets as a backend database for your apps via the API. Build Slack bots and simple applications with spreadsheet integration."
quote:
---

A couple of months back I made a Slack bot that allows everyone in the office to place an order for coffee. We have 1 person who is responsible for ordering coffee. He needs to be able to take a look at all the orders that where placed via the Slack bot. That meant that I needed to build a front-end for him as well.

Or maybe not? He used to manage his orders with Excel, so that got me thinking. Google Sheets is just like Excel, but it also has an API that I can access with my chatbot. Could I use Google Sheets as a backend/database for my bot? Well as it turns out...

<!--more-->

## Google Sheets API
I quickly found that the API for Google Sheets is actually very extensive! Not only does it allow you to read and write data from and to your spreadsheets, you can also extend the UI and even create your own formula's. Wicked!

After a quick look at the documentation I found that I can get the data inside my spreadsheet with the ``spreadsheets.values.get`` API call and that I could create new rows by using ``spreadsheets.values.append``. Pretty easy!

Making things even easier: Google already has a client library for many programming languages, including node.js.

## Not so usable after all
So let's take a look at the output of this API. I've create a simple spreadsheet that could be used as a guestbook or something. This is what it looks like:

![Example Google Sheet](/uploads/google-sheet-as-backend/google-spreadsheet-example.png)

Each row is essentially a record in our little database. Now if we use the API and we fetch range ``A:C`` we get this response:

{% highlight js %}
{
  "range": "Blad1!A1:C1000",
  "majorDimension": "ROWS",
  "values": [
    [
      "timestamp",
      "message",
      "user"
    ],
    [
      "1488806320466",
      "Hi there!",
      "Xavier"
    ],
    [
      "1488806320467",
      "We meet again.",
      "Xavier"
    ]
  ]
}
{% endhighlight %}

Google returns all of our data inside a multidimensional array. That's not so flexible and not future proof.  Each field in our spreadsheet get's translated to a specific place in an array. So here we assume that the timestamp is always in index 0 and that the username is always in index 2.

That's not really nice. What if we want to add a column later? Or what if we switch the order of columns to make it more logical? It would break our implementation!


## Developing a small library
So I thought: let's write a small library that solves this problem and makes working with data in Google Sheets really easy.

The library is called [google-sheets-node](https://github.com/Savjee/google-sheets-wrapper) and it's written in Typescript. It's essentially a small data mapper that fetches data from Google Sheets through the official client library.

It also transforms your data into regular Javascript objects. And that's where the magic happens! Let's see how that works. We take the same spreadsheet and use my library to fetch the data:

![Example Google Sheet](/uploads/google-sheet-as-backend/google-spreadsheet-example.png)

The library will return:

{% highlight js%}
[
	{ timestamp: '1488806320466', message: 'Hi there!', user: 'Xavier' },
	{ timestamp: '1488806320467', message: 'We meet again.', user: 'Xavier' }
]
{% endhighlight %}

As you can see, the data is now a lot easier to work with. We don't have to hard code the index of the fields anymore, we can just use the name of each field to access its value. It's also more flexible: in the future we can add new fields and reorder them as we please, without breaking any code.

So how does it do that? Well the library assumes that the first row in your spreadsheet is the "header row" and contains the name of the field.

![Library uses a header row](/uploads/google-sheet-as-backend/google-spreadsheet-headerrow.png)
*The first row gets a special treatment!*

## Authentication
Let's now see how you can use this library in your own node.js applications. We'll start by authenticating ourselves. To do that follow [the official instructions by Google](https://developers.google.com/sheets/api/quickstart/nodejs) and create some credentials.

After following these steps, you'll get a ``credentials.json`` file. Store it somewhere and create a new environment variable called ``GOOGLE_APPLICATION_CREDENTIALS`` that contains the path to this file. Like so:

{% highlight bash %}
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/my/credentials.json
{% endhighlight %}


### Using the library: reading data
Finally we can start using the library! First we'll start by creating a new instance of it. You have to pass the ID of sheet that you want to use, as well as the range in which your data is stored:

{% highlight js %}
// Open spreadsheet with ID XXXX-XXXX-XXXX and work with columns A to C in worksheet "Sheet 1"
let sheet = new GoogleSheet({
    sheetId: "XXXXXXXXXX-XXXXXXXXX-XXXXXXXX",
    range: "'Sheet 1'!A:C"
});
{% endhighlight %}

Afterwards we can read the data from our sheet by calling ``getRows()``:

{% highlight js %}
let data = await sheet.getRows();
{% endhighlight %}

This will fetch all your data and transform it into easy to use objects!

### Using the library: writing data
Reading data is easy, but it works in the other direction as well. If you want to write data to your spreadsheets, simply create an array of objects and give that to the ``appendRows()`` function and your done!

{% highlight js %}
let data = [
    {
        timestamp: Date.now(),
        message: 'Another message',
        user: 'Peter'
    },
    {
        timestamp: Date.now(),
        message: 'Awesome work!',
        user: 'Simon'
    }
]

await sheet.appendRows(data);
{% endhighlight %}

The order of the fields is not important because we're using regular objects. However all of your objects fields should be in the header row. If not, the library will throw an error.

On the other hand: you can omit rows. They will be inserted as blank cells.

## Conclusion
Since the, I've used Google Sheets as a simple database on a handful of small projects. It's a perfect solution for when you quickly need to throw something together and don't have time to create a nice front-end for non-tech savvy people.

It does have it's limitations though. You cannot query for data and the API is not super fast. So don't try to use this for large datasets that you want to manipulate!

## Source code
The source code for my wrapper is [available on GitHub](https://github.com/Savjee/google-sheets-wrapper). It's not perfect, it was written in a hurry but it works! Feel free to improve it and send me a pull request ;)