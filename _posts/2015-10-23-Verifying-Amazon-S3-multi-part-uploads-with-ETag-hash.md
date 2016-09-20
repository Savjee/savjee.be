---
layout: post
title: Verifying Amazon S3 multi-part uploads with the ETag hash
quote: 
---

Uploading big files to Amazon S3 can be a bit of pain when you're on an unstable network connection. If an error occurs, your transfer will be cancelled and you can start the upload process all over again.

To check the integrity of a file that was uploaded in multiple parts, you can calculate the checksum of the local file and compare it with the checksum on S3. Problem is: Amazon doesn't use a regular md5 hash for multipart uploads. In this post we'll take a look at how you can compute the correct checksum on your computer so you can compare it to the checksum calculated by Amazon.

<!--more-->

# The solution
So if you want to check if your files where transferred correctly, you have to compute the ETag hash in the same way that Amazon does. Luckily there is [this bash script](https://gist.github.com/emersonf/7413337) which splits up your files (like the multipart upload) and calculates the correct ETag hash.

To use it:

  * [Download the script from GitHub](https://gist.github.com/emersonf/7413337) and save it somewhere.

  * In terminal, make it executable:
<pre>
chmod +x s3etag.sh
</pre>

  * Now you can use the script. Say you uploaded a file ``myBigBackup.zip`` and set your multipart upload size to 16 megabytes. After transferring the file to S3 you want to check the integrity:
<pre>
./s3etag.sh myBigBackup.zip 16
</pre>

The script should return the same hash as Amazon has calculate. If not, your file got corrupted somewhere and needs to be re-uploaded.

# Background information
## Multipart & ETag
Multipart uploading splits big files into smaller pieces and uploads them one by one. After receiving all the parts, Amazon will stitch them back together. If one of the parts fail to upload, you just hit "retry" for that piece. You don't have to re-upload the entire file! Great for unstable connections!

Each file on S3 gets an ETag, which is essentially the md5 checksum of that file. Comparing md5 hashes is really simple but Amazon calculates the checksum differently if you've used the multipart upload feature. Instead of calculating the hash of the entire file, Amazon calculates the hash of each part and combines that into a single hash.

## Manually compute the ETag
This is what an ETag looks like:

<pre>57f456164b0e5f365aaf9bb549731f32-95</pre>

It has two parts, separated by a dash. The first part is the actual checksum and the second part indicates in how many parts the file was split during transfer.

To calculate the first part you have to make a list of md5 hashes of all your parts, convert it into binary format and take the md5 hash of it. Afterwards you append a dash and add the number of parts you've split your file in. That's a very brief summary. Check out [this StackOverflow answer](http://stackoverflow.com/questions/12186993/what-is-the-algorithm-to-compute-the-amazon-s3-etag-for-a-file-larger-than-5gb#answer-19896823) if you want to know more.

On Amazon's side this makes a lot of sense: they calculate the hashes of each part as they receive it. After all the pieces are transferred they only have to combine the hashes. No need to read the big file again to calculate the hash.
