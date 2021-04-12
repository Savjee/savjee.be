---
layout: video
collection: videos
title: Environment variables
videoId: 1_sOPBgRAww
order: 11
series: Serverless Framework
uploadDate: 2017-07-04
---

Learn how to use environment variables with Serverless and AWS Lambda. These allow you to store things like database connection settings and API keys. Environment variables can be shared across multiple functions or you can limit them to specific functions only.

## Global
The first way of defining environment variables is by adding them to the ``provider`` section of the ``serverless.yml`` config file.

{% highlight yaml %}
provider:
  name: aws
  runtime: nodejs6.10
  stage: dev
  region: eu-west-1
  profile: savjeebe-demo

  # Available to ALL functions in your service.
  environment:
    GOOGLE_MAPS_API_KEY: key1234
{% endhighlight %}

All variabels that are defined here will be available to all the functions in your project (service).

## Scoped to function
The second way is by adding them to a specific function:

{% highlight yaml %}
functions:
  myFunctionName:
    handler: fileName.handler
    events:
      - http:
          path: myfunction
          method: GET
    environment:
      OTHER_API_KEY: key56789
{% endhighlight %}

Environment variables defined here will only be available to this function. You can also overwrite global environment variables that you defined in the ``provider`` section.

## Using them in node.js
After defining the environment variables you can use them in your Lambda functions. Each of your variables is added to the ``process.env`` object and can be accessed like this:

{% highlight js %}
module.exports.handler = (event, context, callback) => {

  // It has access to global env variables
  console.log(process.env.GOOGLE_MAPS_API_KEY);

  // And also to local scoped variables
  console.log(process.env.OTHER_API_KEY);

  // Some business logic here
  // & calling the callback function
}
{% endhighlight %}

# Useful resources
* <a href="https://serverless.com/framework/docs/providers/aws/guide/functions#environment-variables" target="_blank">Serverless documentation on environment variables</a>
* <a href="http://docs.aws.amazon.com/lambda/latest/dg/env_variables.html" target="_blank">AWS documentation on environment variables</a>

