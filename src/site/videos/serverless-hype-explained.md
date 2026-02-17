---
layout: video
collection: videos
title: "The Serverless Hype Explained!"
videoId: tgFiOzVEL0Q
duration: 428
order: 35
series: Simply explained
date: 2020-09-27
tags: ["Serverless", "Lambda", "Cloud"]
---

Why are "serverless" cloud products so popular right now? What makes them different from using traditional server infrastructure? In this video, I'll go over all the pros and cons of going for a serverless architecture. On it, you can run your website or any web application.

<!--more-->

Want to learn how to build serverless applications with the Serverless framework? [Check out my free course here]({% link collections.courses, "serverless-framework-basics/index.md" %}).

# Hands-on Implementations
See serverless in action with my real-world projects:
- [Building a serverless anagram solver with AWS]({% link collections.posts, '2016-01-20-Building-serverless-anagram-solver-with-aws-dynamodb-lambda-s3-cloudfront-api-gateway.md' %})
- [Serverless Anagram Solver with Cloudflare R2 and Pages]({% link collections.posts, '2022-09-10-serverless-anagram-solver-with-cloudflare-r2-and-pages.md' %})
- [EZStore: a tiny serverless datastore for IoT data]({% link collections.posts, '2022-01-04-ezstore-a-tiny-serverless-data-store-for-iot-data.md' %})

Examples of serverless products include: 

* AWS 
  * [Lambda](https://aws.amazon.com/lambda/) (compute)
  * [DynamoDB](https://aws.amazon.com/dynamodb/) (NoSQL database)
  * [S3]() (storage)
* Google Cloud
  * [Cloud Functions](https://cloud.google.com/functions) (compute)
  * [Firestore](https://cloud.google.com/firestore) / [Big Table](https://cloud.google.com/bigtable) (NoSQL databases)
  * [Cloud Storage](https://cloud.google.com/storage)
* Microsoft Azure
  * [Functions](https://azure.microsoft.com/en-us/services/functions/) (compute)
  * [Cosmos DB](https://azure.microsoft.com/en-us/services/cosmos-db/) (NoSQL database)
  * [Blob storage](https://azure.microsoft.com/en-us/services/storage/blobs/)

# Sources
This video wouldn't be possible without the work of others. Here are the sources I've used during my research & script writing:

{% bibtex %}

@online{src,
    title={What is Serverless Architecture? What are its Pros and Cons?},
    url={https://hackernoon.com/what-is-serverless-architecture-what-are-its-pros-and-cons-cc4b804022e9},
    author={Faizan Bashir},
    year={2018},
    month={5},
    day={19}
}

@online{src,
    title={What Is Serverless Computing? | Serverless Definition},
    url={https://www.cloudflare.com/learning/serverless/what-is-serverless/},
    organization={Cloudflare},
}
@online{src,
    title={Slashdot effect},
    url={https://en.wikipedia.org/wiki/Slashdot_effect},
    organization={Wikipedia},
}
@online{src,
    title={Serverless computing},
    url={https://en.wikipedia.org/wiki/Serverless_computing},
    organization={Wikipedia},
}
{% endbibtex %}