---
layout: post
title: Uploading your own SSL certificate to Amazon CloudFront
quote: 
---

I've been wanting to add HTTPS support to my website for quite some time and never got around it. Enabling SSL has several benefits such as increased privacy and a slight boost in search ranking. I know that my blog doesn't really benefit from the increase of privacy, but I wanted to enable it anyway.

This blog [is powered by the static website generator Jekyll]({% post_url 2013-01-14-moving-from-Wordpress-to-Jekyll %}), [stored on Amazon S3]({% post_url 2013-02-01-howto-host-jekyll-blog-on-amazon-s3 %}) and served through CloudFront. Since 2014 it is possible to serve your own SSL certificate through CloudFront by using SNI or Server Name Indication. Let's take a look at how you can upload your own SSL certificate to the service.

<!--more-->

# Update: January 24th 2016
You can now get a free certificate from AWS Certificate Manager and link it to CloudFront in just a couple of minutes! No manually action required! Check out my video tutorial here:

{% include youtube-embed.html videoId='JbQbwum196g' %}

# Getting ready
I'll assume that you already know how to get a SSL certificate. It's not that hard, not expensive and in some cases even free! I've used [a free StartSSL certificate](https://www.startssl.com/) for my blog.

Before you can use your own certificate in CloudFront, you have to upload it to IAM (Identity & Access Management). Uploading a certificate is only possible by command line. 

  * Start by creating a new user in IAM. I've called mine ``sslupload`` and temporarily gave it all rights to IAM. Keep a copy of the generated credentials.

  * Now install the ``aws`` tools with Python's PIP tool:
<pre>sudo pip install awscli</pre>

  * Configure the ``awscli`` and give it your credentials:
<pre>aws configure</pre>

## Uploading a certificate
After these preparations you can upload your certificate to IAM:

<pre>aws iam upload-server-certificate --server-certificate-name savjeeSSL2015 --certificate-body file://ssl.crt --private-key file://ssl.key --certificate-chain file://sub.class1.server.ca.pem --path /cloudfront/</pre>

Explanation of the used options:

  * ``--server-certificate-name``, gives your certificate a name so you recognise it later on. This can be anything.
  * ``--certificate-body``, the path to your signed certificate.
  * ``--private-key``, the path to the private key that you've used for signing the certificate.
  * ``--certificate-chain``,  the intermediate key that you got from your certificate authority.
  * ``--path``, tells AWS that the certificate is intended to be used by CloudFront.

Make sure that you add ``file://`` before every path, otherwise the tools will complain about the certificates not being in PEM format:

<pre>A client error (MalformedCertificate) occurred when calling the UploadServerCertificate operation: Unable to parse certificate. Please ensure the certificate is in PEM format.</pre>

Now that the certificate has been uploaded, disable the IAM user we created previously.

# Enabling the certificate
All that's left is to enable the certificate. Login to the [AWS Management Console](https://console.aws.amazon.com/console/home), go to CloudFront and edit the settings of your distribution.

  * Enable the option "Custom SSL Certificate (stored in AWS IAM)" in the section "SSL Certificate"
  * Set the "Custom SSL Client Support" to "Only Clients that Support Server Name Indication (SNI)"

![](/uploads/uploading-ssl-certificate-cloudfront/cloudfrontsettings.png)

Done! Save the settings and wait for the changes to be propagated across the network. After a few minutes [my blog was accessible over HTTPS](https://www.savjee.be)! Just remember to upload a new certificate before it expires.

# Deleting a certificate
If you want to delete a certificate from IAM you can use the ``delete-server-certificate`` command like this:

<pre>aws iam delete-server-certificate --server-certificate-name savjeeSSL2015</pre>

As parameter you pass the name of the certificate that you want to remove. Easy!