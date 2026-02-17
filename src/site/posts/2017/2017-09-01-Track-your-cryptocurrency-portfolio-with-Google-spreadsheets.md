---
layout: post
title: Track your cryptocurrency portfolio with Google Spreadsheets
quote:
---

Buying and trading cryptocurrencies is all the rage right now. But how do you actually keep track of your investments? Especially if you do them on various websites. There are a few websites out there that allow you to do this, but most of them are rather complex.

Instead I made a simple spreadsheet in Google Drive and added a little Google Script magic to it so that it automatically updates my losses/profits. Let's take a look at how it works!

<!--more-->

## Why?
I have accounts on a few exchanges that allow me to buy different coins. Not having a central place to check up on my portfolio makes it very time consuming to check your positions.

## Google Spreadsheets
I immediately thought that a spreadsheet could be a great solution to my problem. Just enter all of my purchases and sales in a Google spreadsheet and done! However, a spreadsheet can not update the value of your coins dynamically. For that it needs to fetch the prices of each coin from an API. I was certain that I needed to write a simple web app for this...


## Enter Google Apps Script
Just as was about to give up on using a spreadsheet, I discovered that Google offers the ability to write scripts inside their documents. These scripts have full access to the internet, they can update data in the documents, they run on Google's servers and they can run on a schedule.

That sounds exactly like what I need!

## My spreadsheet
So let's take a look at how I constructed my spreadsheet. It consists out of 2 sheets:

### Sheet 1: overview of coins
To calculate profits/losses I need to know the current price of each coin that I own. So I started by creating a table for all the coins that I'm currently tracking or that I currently own.

![](/uploads/cryptocurrency-portfolio-google-sheets/sheet-1.png)
*Overview of coins that I want to track*

For each coin I keep track of the current price, the amount I have invested in it (``SUMIF`` function), the changes of the price over a few intervals and my opinion with some notes.

Without some scripting magic, the price of the coin is obviously not updated dynamically so bear with me.


### Sheet 2: purchases
Next, I created a sheet for all my purchases. Every purchase is a single row and contains details about when I bought the coins, how many I bought, at what price I bought them and what their current value is.

The real-time value of a coin is retrieved from the first sheet by using a ``VLOOKUP()`` function.

![](/uploads/cryptocurrency-portfolio-google-sheets/sheet-2.png)
*I wish these numbers were real...*


I also added some columns for when I sell a coin. This allows the spreadsheet to calculate my definitive profits/losses.


## The script
Now let's make all of this dynamic! We need a way to update the first sheet with the real-time prices of each coin. If we update that sheet, the other sheet will also update because of the ``VLOOKUP()`` function.

Google Apps Script to the rescue! I wrote a small script that talks to the [coinmarketcap.com API](https://coinmarketcap.com/api/) and fetches a list of all the coins along with their prices in Euro (you could do the same for USD).

![](/uploads/cryptocurrency-portfolio-google-sheets/script-editor.png)

After getting a response from the API, it iterates over the first sheet and fills in the value of each coin along with the price changes.

{% highlight js %}
function fetchFromCoinMarketCap() {
	const SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
	const PRICE_SHEET = SPREADSHEET.getSheets()[1];
	const RANGE = "B:G";


	var trackedCoins = PRICE_SHEET.getRange(RANGE).getValues();

	// Make the single request
	var response = UrlFetchApp.fetch("https://api.coinmarketcap.com/v1/ticker/?convert=EUR");
	response = JSON.parse(response);

	for(var i = 1; i < trackedCoins.length; i++){
		if(trackedCoins[i][0] == "") continue;

		var coinTicker = trackedCoins[i][0];

		// Get the correct coin from the response
		var coin = response.filter(function(coin){
			return coin.symbol === coinTicker;
		})[0];

		// Update the values in the virtual array
		if(coin){
			trackedCoins[i][1] = coin.price_eur.replace('.',',');
			trackedCoins[i][3] = formatPercent(coin.percent_change_1h);
			trackedCoins[i][4] = formatPercent(coin.percent_change_24h);
			trackedCoins[i][5] = formatPercent(coin.percent_change_7d);
		}
	}

	// Flush the array to the spreadsheet in 1 go
	PRICE_SHEET.getRange(RANGE).setValues(trackedCoins);
}

function formatPercent(value){
	return value.replace('.', ',') + "%";
}
{% endhighlight %}

The script is pretty efficient. It reads the data from the spreadsheet as a multi-dimensional array. It then updates the values in the array with the data from the API. Afterwards it dumps all of this new data into the spreadsheet in 1 go! (Much better then my original version that updated each cell individually. Sorry Google for the wasted cycles...)


## Running it periodically
The final step is to make sure that the script runs periodically so that our spreadsheet always has the latest information. Luckily Google has our back (again)!

You can set up a trigger that will execute your function when a certain event occurs. This can be an event in the spreadsheet or on a time interval.

![](/uploads/cryptocurrency-portfolio-google-sheets/trigger.png)

I configured the trigger so that the script runs every 5 minutes. You can even ask it to send you an email should there be any errors during executions.

And that's it! My spreadsheet now updates itself every 5 minutes without me having to do anything. Everything runs on Google's servers: I can even close the spreadsheet and it will still update itself!

## Conclusion
I've been using Google Drive and it's suite of office products for a while now. I always considered them great tools for collaboration.

Discovering Google Apps Script was huge for me. It's incredibly powerful and it really allows you to make documents that come alive and integrate with other services. I'll definitely use this feature more in the future!


## Get it for yourself
Want to use this simple spreadsheet for yourself? Here is the link to the spreadsheet:

[https://docs.google.com/spreadsheets/d/180gVT258omc4YE5ixtwbVPLS4q56ma9-70OHrKc2hoo/edit?usp=sharing](https://docs.google.com/spreadsheets/d/180gVT258omc4YE5ixtwbVPLS4q56ma9-70OHrKc2hoo/edit?usp=sharing)

To get a copy of this spreadsheet in your own Google Drive: go to "File" and click on "Make a copy...".

![](/uploads/cryptocurrency-portfolio-google-sheets/make-copy.png)


## Buy crypto for yourself
Want to start buying Bitcoin, Ethereum or Litecoin? [Consider buying them through my Coinbase referral link](https://www.coinbase.com/join/59284524822a3d0b19e11134). If you buy a $100 worth of crypto, you will get $10 for free (and I'll get a $10 dollar commision).

## Related Content
To understand how Bitcoin wallets and addresses work technically, watch: [How Bitcoin Wallets Work](https://www.youtube.com/watch?v=GSTiKjnBaes).