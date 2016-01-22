---
layout: post
title: Building a serverless anagram solver with AWS (DynamoDB, Lambda, S3, CloudFront and API gateway)
quote: 
---

When I was in high school (2011) I wrote a simple anagram solver in PHP. It used a MySQL backend to store multiple dictionaries and was pretty fast. Fast forward to 2015: the anagram solver is still online but I wanted to revamp it. The goal? Build the anagram solver on top of AWS and go serverless. That’s right! No servers, **just me and my code**.

Sounds like fun? I agree!

<!--more-->

# Current situation
So let's take a look at the services/servers that are currently required for my original anagram solver:

  * **A webserver with PHP**: this server handles all incoming requests, runs some magic and queries the database.
  * **A MySQL database**: serves as a place to store the dictionaries.
  * **A place to live**: basically any webhost will do!

I hosted the anagram solver on a cheap webhosting package. This meant regular slow downs as the servers received more traffic and an unreliable MySQL database. To top it off, I was paying a fixed amount every month to keep the service running. It didn't matter if the solver got 10 hits or 10 million, I was still paying the same price.

# AWS alternatives
I began searching for AWS alternatives to these requirements. The most easiest solution is to install these services on an EC2 instance. However, that would mean being responsible for the setup, maintenance and scalability of a server. No servers!

Instead I discovered **Amazon Lambda**:

> AWS Lambda is a compute service where you can upload your code to AWS Lambda and the service can run the code on your behalf using AWS infrastructure. After you upload your code and create what we call a Lambda function, AWS Lambda takes care of provisioning and managing the servers that you use to run the code.

So it allows you to run code in the cloud without having to worry about servers? Great! Oh and you also pay for what you use. No fixed fees. Suddenly see a spike in traffic? No problem, Amazon will spawn more instances of your code automatically to handle the load. 

Lambda functions can be written in Java, Node.js or Python. They are stateless pieces of code that can't run for longer than 300 seconds. This makes them perfect for building an API. 

Next stop: a place to store a dictionary. Amazon has multiple cloud database solutions but it comes down to RDS and DynamoDB. RDS stands Relational Database Service and can run a variety of database engines including MySQL. This would be the easiest transition for my anagram solver since it used MySQL before. However, RDS is pricey and DynamoDB looks way sexier:

>Amazon DynamoDB is a fast and flexible NoSQL database service for all applications that need consistent, single-digit millisecond latency at any scale.

Low latency and high scalability? Sign me up! **DynamoDB** can handle extreme loads and is very suitable for non-relational datasets (such as a dictionary).

The final part is a place for the front-end to live. The current anagram solver has a front-end that uses AJAX to get the results from the server. It's basically a static website and it so happens that [I already have experience with hosting static websites on Amazon S3]({% post_url 2013-02-01-howto-host-jekyll-blog-on-amazon-s3 %}) and CloudFront. Using these services was a no-brainer!

So that's it! Replace the webserver with S3 and CloudFront, replace PHP with Lambda and replace MySQL with DynamoDB. How hard can it be? In the next sections I'll dive deeper into each transition but let’s first take a look at the pro’s and cons of this serverless approach.

# Pro's and cons
Is it really worth it to remove the need for a server? As it turns out: yes!

The obviously biggest advantage of this approach is that you don’t have to worry about allocating resources, availability, maintenance, security patches, uptime, ... Amazon will handles these aspects for you! Besides that it’s also worth noting that you only pay for what you use. If my anagram solver wasn't used during an entire month, I would pay exactly nothing.

The only disadvantage of this approach - that I could come up with - is that you’re completely dependant on AWS. If Amazon would decide to stop with DynamoDB, you'll be left with no drop-in alternatives. You would have to export your data and import into a different database engine such as MongoDB. The same thing goes for Lambda functions.


# DynamoDB
The anagram solver needs a dictionary of words to be able to solve anagrams. I created a very simple DyanmoDB table to store my dictionaries. For each word in the dictionary, I store a special ``alpha`` version of the word with it. This is basically the same word with it's individual letters sorted alphabetically. So for the word ``dog`` I get the ``alpha`` version: ``dgo``. I'll go more in detail about how I actually solve anagrams later.

![](/uploads/anagram-aws/dynamodb-structure.png)
*The structure of the DynamoDB table.*

Importing this dictionary into DynamoDB wasn't as easy as I had hoped it would be. You basically have two options: write a script that uses the AWS SDK and pushes each item to DynamoDB or use the [AWS Data Pipeline](https://aws.amazon.com/datapipeline/). The last option is officially recommended by Amazon but not so trivial.

I started by exporting the dictionaries that I already had to a CSV file and than importing it with AWS Data Pipeline. Apparently it’s not possible to import a CSV with Data Pipeline. Instead you have to feed it a bunch of JSON objects. I wrote a small PHP script to convert the CSV file into something that Data Pipeline could read and started the import. So far so good!

The next day I checked the pipeline and saw that it was still running. I wondered how long it would take for it to completely import 600k words into DynamoDB. I decided to wait and give it another day. However, I suddenly discovered that Data Pipeline used multiple large EC2 instances for the import. All of a sudden my bill rose to almost $150. I quickly cancelled the Data Pipeline and Amazon was kind enough to give me a one-time credit for the charges. Phew!

![](/uploads/anagram-aws/exploded-aws-bill.png)

So after this adventure I created a PHP script that groups 20 words together and send them to DynamoDB using [the official PHP SDK](https://aws.amazon.com/sdk-for-php/). After sending these words, the script pauses itself for 1 second to stay under my DyanmoDB write provision. It took the script almost 14 hours to completely import the dictionary but at least it was free!

# Lambda
After uploading the dictionary to DyanmoDB, I reprogrammed the anagram solver's logic into a Lambda function. I choose to use Node.js as programming language because I'm more familiar with Javascript. Python was an interesting option but I decided to stick to the language I knew best. Java wasn't a real contender in my eyes because it has very long warm up times (up to 3 seconds for cold requests).

The logic for the anagram solver is very simple: take a string as input, re-arrange the letters of the input in alphabetic order and check if that string exists in the database. If it does, we can return the solutions for the anagram. If not, .... Well, I'm sorry!

Here is the Lambda function that powers the current anagram solver:

{% highlight javascript %}
var doc = require('dynamodb-doc');
var dynamo = new doc.DynamoDB();

exports.handler = function(event, context) {
    // Make sure that you validate the input before using it. 
    // I left the validation out for this post
    var inputAnagram = event.anagram;
    var inputLanguage = event.lang;
    
    //
    // Sort characters alphabetically
    //
    var chars = inputAnagram.split('');
    chars = chars.sort();
    
    inputAnagram = chars.join('');
    
    //
    // Construct the parameters for the DyanmoDB query
    //
    var params = {
        TableName : "anagram-en",
        KeyConditionExpression: "alpha = :input",
        ExpressionAttributeValues: {
            ":input": inputAnagram
        }
    }
        
    
    console.log("Querying the table...");
    dynamo.query(params, onQuery);
    
    function onQuery(err, data) {
        if (err) {
            console.error("Unable to query the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
  	    // Construct the output
            var output = {
                'resultCount': 0,
                'results': []
            };
          
            // Add each element to the return object
            data.Items.forEach(function(anagramSolution){
                output.results.push(anagramSolution.word);
                output.resultCount++;
            });
            
            // Return the JSON to the client
            context.succeed(output);
        }
    }
};
{% endhighlight %}

## Performance of Lambda
Lambda functions written in Node.js are pretty fast (once they're actively being used and warmed up). The initial startup time for this function is about 700ms. That's quite a lot but consecutive runs are much faster and take 100-200ms to complete. Much better!

# API Gateway
At this point I already replaced the database and main logic of the anagram solver. The only thing that's left is to make the Lambda function available through an openly accessible API. The preferred way of doing this is through Amazon's API Gateway.

Connecting AWS Lambda with an API should be easy and straightforward but it's not. I ran into a lot of issue's with the management console and got a lot of "Service errors" without much of an explanation. I initially linked Lambda manually to an API but after a few days, the automatic linking started to work!

So here is how I proceeded:

  * Go to the Lambda console and open your function
  * Click on the tab "API endpoints" and click on "Add API endpoint"

![](/uploads/anagram-aws/lambda-add-api-endpoint.png)

  * Now Amazon asks some parameters about how we're going to use the API.
  * Fill in the information and click "Submit"

![](/uploads/anagram-aws/lambda-add-api-endpoint2.png)

Amazon will now create a new API in API Gateway and will link it up to your Lambda function. However, I still needed to configure the API so that it can accept the ``anagram`` and ``lang`` parameters.

  * I went back to the API Gateway console, opened up my API and added both parameters as ``URL Query String Parameters`` to the ``Method Request``

![](/uploads/anagram-aws/api-gateway-method-request.png)
*Allow our front-end to send two URL parameters to the API.*

  * After that, I went to the ``Integration request`` and added a new mapping template. When a request arrives, Amazon will populate this template with the URL parameters and pass it on to the Lambda function:

![](/uploads/anagram-aws/api-gateway-mapping-template.png)
*The mapping template for the anagram solver.*

  * I than deployed the API and Amazon gave me a URL to access the API.

![](/uploads/anagram-aws/api-gateway-deploy.png)

API Gateway was pretty easy to set up and works really well! Here's a nice graphical overview of the API that Amazon generates:

![](/uploads/anagram-aws/api-gateway-overview.png)
*Amazon visualises the your API's internal flow.*

# S3 & CloudFront
Now that we have an API it's time to develop a front-end so that it’s easy for everyone to solve their anagrams. I asked my friend [Cédric](http://www.berlez.be/) to develop a simple front-end. However, these where the rules:

  * Only use HTML, CSS and Javascript, no server-side languages (It should be a static website so it can be hosted on S3)
  * Don't make the interface any more complicated than the existing situation
  * Make sure it's responsive

After a couple of days he came back with a simple front-end implementation, built on top Bootstrap and jQuery. We went back and forth a couple of days to tweak the design and the behaviour. From there I continued: I uploaded the static front-end to [a S3 bucket and enabled static website hosting]({% post_url 2013-02-01-howto-host-jekyll-blog-on-amazon-s3 %}).

![](/uploads/anagram-aws/s3-hosting.png)
*The anagram solver's files hosted in a S3 bucket*

To make things even faster I created a new CloudFront distribution so the front-end is served from Amazon's CDN. To finish it off, I linked the CloudFront distribution to my subdomain [anagram.savjee.be](http://anagram.savjee.be/).

All done!


# Scalability
So how scalable is this serverless application anyway? Well let's take a look at the individual AWS services and how scalable they are:

  * **DyanmoDB** scales very nicely and distributes your data automatically across multiple machines as needed. It can store unlimited data and can serve up to 10,000 reads/second. If that's not enough you can ask Amazon to raise that limit.

  * **Lambda** functions are stateless and can scale without effort. Amazon will automatically use more EC2 instances to run your code as demand increases. There is however a safety throttle of 100 concurrent executions per region but that can be increased.

  * **API Gateway** can handle "any number of requests per second", read: as much as your back-end can handle.

  * **S3**'s scalability is in theory not relevant because it sits behind CloudFront. Still, it allows you store unlimited files of up to 5 terabytes in size.

  * **CloudFront** can handle up to 15,000 requests/second and reach transfer speeds of up to 10 Gbps per distribution. Again: if you want more you can ask Amazon to raise these limits.

Basically it comes down to money. You pay for what you use so if you have an unlimited budget, you'll have an architecture that scale infinitely.

# Final result
Here's a screenshot of the new version of "Xavier's anagram solver":

![](/uploads/anagram-aws/final-result.png)
*The final result!*


Want to see it in action? Go to [anagram.savjee.be](http://anagram.savjee.be) and start solving those riddles!

# Conclusion
Let's wrap up this post. This was my first experience with building an serverless application that runs entirely on AWS and I must say I'm impressed. The idea of running a service without managing servers or services is pretty nice. I also don't have to worry about taking backups of my database. I now pay for what I've consumed and not a fixed amount every month. 

![](/uploads/anagram-aws/overview-serverless-anagramsolver.png)
*Before and after.*