---
title: Deploy other AWS resources
videoId: P-QPUdQnc3E
duration: 563
order: 10
date: 2017-06-27
---

Learn how to deploy other AWS resources by specifying them in the serverless.yml file. Whenever you deploy your app, Serverless will provision these resources through CloudFormation. It will also make sure that your application is always in a consistent state and will rollback changes if something goes wrong.

In this video I show you how to provision an S3 bucket and a DynamoDB table. This is the code snippet used in the video:

{% highlight yaml %}
resources:
  Resources:
    uploadBucket:
      Type: AWS::S3::Bucket
      Properties:
        BucketName: ${self:service}-${self:provider.stage}-uploads

    userTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:service}-${self:provider.stage}-users
        AttributeDefinitions:
          - AttributeName: userId
            AttributeType: S
        KeySchema:
          - AttributeName: userId
            KeyType: HASH
        ProvisionedThroughput:
          ReadCapacityUnits: 1
          WriteCapacityUnits: 1
{% endhighlight %}

You can provision almost any resource on AWS this way. Want to deploy another resource that wasn't shown in this video? Luckily Amazon has a bunch of examples on it's website: <a href="http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html" target="_blank">AWS Resource Types Reference</a>.

## Useful resources
* <a href="http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html" target="_blank">AWS Resource Types Reference</a>