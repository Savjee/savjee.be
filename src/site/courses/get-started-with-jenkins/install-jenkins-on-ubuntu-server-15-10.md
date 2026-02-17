---
title: Installing Jenkins on Ubuntu Server 15.10
videoId: AXlN-f6Uk64
duration: 281
order: 2
date: 2016-03-15
courseName: "Get started with Jenkins"
---

In this video I'll show you how you can install Jenkins on Ubuntu Server 15.10. The same instructions will also work for the latest release of Ubuntu Server (16.10).

## Installation commands
{% highlight bash %}
## Download the security key for the Jenkins repository & add it to the keychain
wget -q -O - https://jenkins-ci.org/debian/jenkins-ci.org.key | sudo apt-key add -

## Add the Jenkins sources to apt
sudo sh -c 'echo deb http://pkg.jenkins-ci.org/debian binary/ > /etc/apt/sources.list.d/jenkins.list'

## Update the list of packages
sudo apt-get update

## Install Jenkins (will also install its dependencies, eg OpenJDK)
sudo apt-get install jenkins
{% endhighlight %}

The commands are also available on <a href="https://github.com/SavjeeTutorials/getting-started-with-jenkins/tree/master/02-installing-jenkins" target="_blank">GitHub</a>.

## Useful resources
* <a href="https://wiki.jenkins-ci.org/display/JENKINS/Installing+Jenkins+on+Ubuntu" target="_blank">Official installation instructions</a>