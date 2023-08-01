---
layout: video
collection: videos
title: "How Do NoSQL Databases Work?"
videoId: 0buKQHokLK8
duration: 458
order: 37
series: Simply explained
date: 2020-12-08
tags: ["NoSQL"]
---

NoSQL databases power some of the biggest sites. They're fast and super scalable but how do they work?

Behind-the-scenes, they use a keyspace to distribute your data across multiple servers or partitions. This allows them to scale horizontally across many thousand servers.

NoSQL databases can operate in multiple modes: as key-value store, document store or wide column store.

<!--more-->

You can run your own NoSQL database with software like Cassandra, CouchDB, MongoDB or Scylla. You can also use a cloud version like AWS DynamoDB, Google Cloud BigTable or Azure CosmosDB.

# Sources
This video wouldn't be possible without the work of others. Here are the sources I've used during my research & script writing:

{% bibtex %}
@online{src,
    title={NoSQL},
    url={https://en.wikipedia.org/wiki/NoSQL},
    organization={Wikipedia}
}
@article{decandia2007dynamo,
  title={"Dynamo: amazon's highly available key-value store"},
  author={DeCandia, Giuseppe and Hastorun, Deniz and Jampani, Madan and Kakulapati, Gunavardhan and Lakshman, Avinash and Pilchin, Alex and Sivasubramanian, Swaminathan and Vosshall, Peter and Vogels, Werner},
  journal={ACM SIGOPS operating systems review},
  volume={41},
  number={6},
  pages={205--220},
  year={2007},
  publisher={ACM New York, NY, USA}
}
@online{src,
    title={"AWS re:Invent 2018: Amazon DynamoDB Deep Dive: Advanced Design Patterns for DynamoDB (DAT401)"},
    url={https://www.youtube.com/watch?v=HaEPXoXVf2k},
    organization={Amazon Web Services},
    year={2018},
    month={11},
    day={28}
}

@online{src,
    title={Amazon DynamoDB},
    url={https://en.wikipedia.org/wiki/Amazon_DynamoDB},
    organization={Wikipedia}
}

@online{src,
    title={Apache Cassandra},
    url={https://en.wikipedia.org/wiki/Apache_Cassandra},
    organization={Wikipedia}
}

@online{src,
    title={Amazon Prime Day 2019 – Powered by AWS},
    url={https://aws.amazon.com/blogs/aws/amazon-prime-day-2019-powered-by-aws/},
    author={Jeff Barr},
    year={2019},
    month={8},
    day={16}
}

@online{src,
    title={"SQL vs NoSQL: 5 Critical Differences"},
    url={https://www.xplenty.com/blog/the-sql-vs-nosql-difference/},
    author={Mark Smallcombe},
    year={2020},
    month={5},
    day={19}
}
{% endbibtex %}