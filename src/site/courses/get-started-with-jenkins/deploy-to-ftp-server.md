---
title: Deploying to a FTP server
videoId: ZdUk3UeG8JQ
duration: 458
order: 8
date: 2016-03-15
courseName: "Get started with Jenkins"
---

In this video I'll show you how you can use Jenkins to automatically deploy your code to a FTP server. You could use this to automatically upload your website to your hosting provider, each time you make a commit.

I will be using git-ftp to upload files from a git repository to a FTP server. This piece of software will only upload changed files to your server, so it's very efficient. It will also remove any deleted files from your server.

## BitBucket Pipelines
Don't want to use Jenkins? You can also use BitBucket Pipelines to upload files to a FTP server. [Check out my blog post here]({% link collections.posts, "2016-06-01-Deploying-website-to-ftp-or-amazon-s3-with-BitBucket-Pipelines.md" %}).

## Useful resources
* <a href="https://git-ftp.github.io/" target="_blank">The git-ftp website</a> & <a href="https://github.com/git-ftp/git-ftp" target="_blank">project page</a>
