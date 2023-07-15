---
title: Core concepts
videoId: wP7a9IosX3g
duration: 249
order: 3
date: 2017-06-06
---

In this video we'll take a look at the core concepts that you should understand when you want to start using the Serverless framework.

## Functions
Functions are small pieces of code that should only do 1 thing. They take a certain input, process it and deliver some output.
The idea is to have a lot of tiny functions that make up a big application. This technique is often referred to as microservices.

Creating and managing a ton of funtions sounds like a lot of work, but don't worry. Serverless will deploy all of them with a single command.

## Events
Your functions can only run after certain events. On AWS, many services can trigger an event. For example: you could trigger a function whenever you upload a new file to a S3 bucket. To do that, you configure S3 to send an event to your Lambda function. In turn, your Lambda function could perform actions on the newly uploaded file (such as generating thumbnails for an image).

Not only S3 can send events to Lambda. Other services such as DynamoDB and API Gateway can do the same.

Using the Serverless framework, you can define all the events that can trigger your function in the ``serverless.yml`` file. When you deploy to AWS, the framework will automatically create all these events for you.

## Resources
Resources refer to other AWS services that your application needs. For example: you might use DynamoDB to store details of your users. You might also need an S3 bucket for storing file uploads.

You could manually create each of these, but that would be time consuming and difficult to repeat. Instead you can define them in a single file (in ``serverless.yml``) and Serverless will provision them for you.

Some benefits of using this technique include:

* Serverless will make sure that your entire infrastructure is stable. It will automatically rollback changes if an error occurs during a deploy.
* You can re-deploy to a new cloud any moment. You only have to run ``sls deploy`` when you want to deploy your app to another AWS account.


## Services
A service is basically a group of functions, events and resources. If you're building a backend for your website, then your service might be called "website-backend". This service will contain many functions (eg: getBlogPost, getOverview, getAuthors, ...) and other resources.

You can create 1 service for you entire project or you can create many services. This usually depends on how complex your application is.

## Plugins
Plugins are pieces of code that can extend the functionalities of the framework. For example, there are plugins that can optimize your JavaScript code when you deploy or plugins that add support for TypeScript, ...