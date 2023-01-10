---
layout: post
title: Using Duplicity to Backup LXC Containers
quote:
---

Last year I wrote [a blog post about how to use LXC containers on a VPS]({% link collections.posts, '2016-05-09-Getting-started-with-LXC-on-a-Scaleway-cloud-server' %}). I've been running this setup for quite a while now and it has been great. However, my approach involved making full copies of my containers. Not very space or cost efficient!

So it was time to revisit my backup strategy: I started using Duplicity to take incremental and encrypted backups of my LXC containers. I also switched from Amazon S3 to BackBlaze B2 to further reduce my storage costs.

<!--more-->

## Why duplicity
[Duplicity](http://duplicity.nongnu.org/) is a command line tool that allows you take incremental backups using the rsync algorithm. That means that it only copies the bits that have changed since the last full backup. This makes the backup space efficient but also bandwidth efficient.

It's a very complete tool. Not only does it take backups, it can also encrypts them with GnuPG, it can upload your backups to several cloud services and it handles restores as well. This happens in 1 go, so you don't have to worry about transferring your backups to and from the cloud.

## Backblaze B2
Backups also need a place to be stored. I previously used the Standard Infrequent Access storage tier of Amazon S3. However, I found that Backblaze offers a similar service at a fourth the price! So while I was revamping my backup strategy, I also decided to start using [B2](https://www.backblaze.com/b2/cloud-storage.html) and migrate away from S3.

Here is a simple price comparison between B2 and S3 (not taking free tiers into account):

<table class='pure-table pure-table-bordered'>
	<tr>
		<td></td>
		<td><b>Backblaze B2</b></td>
		<td><b>Amazon S3</b></td>
		<td><b>Amazon S3 Infrequent access</b></td>
	</tr>
	<tr>
		<td><b>Store 1GB</b></td>
		<td>$0,005</td>
        <td>$0,023</td>
        <td>$0,0125</td>
	</tr>
	<tr>
		<td><b>Download 1GB</b></td>
		<td>$0,02</td>
        <td>$0,04</td>
        <td>$0,01</td>
	</tr>
</table>

B2 is 4 times cheaper compared to the regular storage class of Amazon S3. So that means I can cut my costs down or keep more backups for the same price. Download prices are pretty high across the board but I rarely need to restore a backup.

## Installing Duplicity
After deciding where to store my backups, I installed Duplicity on my Ubuntu Server:

<pre>sudo apt-get install duplicity</pre>

Depending on your version of Ubuntu, apt might install a old version of Duplicity. To install the latest and greatest version, I installed it from [this PPA](https://launchpad.net/~duplicity-team/+archive/ubuntu/ppa):

<pre>sudo add-apt-repository ppa:duplicity-team/ppa
sudo apt-get update
sudo apt-get install duplicity
</pre>


## Backing up LXC containers
To make a backup with Duplicity, simply give it a source and a destination for your backup. The basic syntax is:

<pre>duplicity [SOURCE_DIRECTORY] [DESINATION]</pre>

Here is a more practical example: taking a backup of my Nginx container and uploading it to a SFTP server:

<pre>duplicity /var/lib/lxc/nginx sftp://username@some-server.com/some-dir/</pre>

When you run this command for the first time, Duplicity will take a full copy of your directory. Subsequent runs will only backup incrementally. Simple!

### Backing up to B2
If you want to backup to an external service, it gets a bit more complicated because you have to provide an access key to authenticate yourself. In case of Backblaze B2 you need your account id and an application key (both can be obtained through the web interface).

Here is the same example but this time uploading your backup to a B2 bucket:

<pre>duplicity /var/lib/lxc/nginx b2://[account_id]:[application_key]@[bucket_name]/[folder]</pre>

This syntax might look a bit different if you are using another cloud provider. Luckily the documentation has an example for each supported service.

### Rotating backups
In normal situations you want to limit the amount of backups that you keep around. This option is integrated into Duplicity and it can rotate backups for you. When used, Duplicity will remove backups after a certain period of time.

To rotate your backups you have to run a separate command. In my case I always start by taking a new backup and when it's finished, I run the ``remove-older-than`` command:

	duplicity remove-older-than 2M b2://[account_id]:[application_key]@[bucket_name]/[folder]

Note that I don't specify a source directory because this command doesn't take a backup, only remove older backups from the cloud. Also note that I delete backups older then ``2M`` or 2 months. Duplicity supports a variety of date formats, so check [the documentation](http://duplicity.nongnu.org/duplicity.1.html) if you want to use a different one.

Incremental backups are stored as chains. That means that it starts with a full backup and only backs up the changed bits afterwards. If you want to restore, Duplicity takes your full backup and applies all the incremental backups to it. Longer chains require more time to restore a backup and they also increase the chances of something going wrong. You can only restore to a certain point in the past if all of the incremental backups are available, not if they are lost or got corrupted.

For those reasons, I ask Duplicity to force a full backup each month by adding a parameter:

<pre>duplicity [SOURCE] [DESTINATION] --full-if-older-than 30D</pre>

Note that here I use ``30D`` to represent a month, but you could also use ``1M``.

### Ignoring certain system files
In case of LXC containers: not all files should be backed up. Temporary files and caches should be excluded from the backup. They only make backups larger. With Duplicity you can exclude files based on a regex pattern or you can create a file that contains a bunch of patterns it should ignore. I chose to use the latter and created a ``exclude-backup.txt`` file that contains the paths that Duplicity should ignore:

<pre>**/rootfs/tmp
**/rootfs/proc
**/rootfs/run
**/rootfs/mnt
**/rootfs/media
**/rootfs/root/.cache/duplicity
**/rootfs/var/cache/apt
</pre>

It's straightforward why some of these paths are being ignored. Caches and temporary files aren't needed when you want to restore your containers. Others are ``/proc`` and ``/run`` which contain runtime system information. I also ignore mount points in ``/mnt`` and ``/media`` because those might not be available when restoring your container.

After creating the ignore file, I pass it to Duplicity with the exclude option:

<pre>duplicity --exclude-filelist /root/exclude-backup.txt [SOURCE] [DISTINATION]</pre>

### Encrypting backups
The last thing I wanted to do was to encrypt my backups before uploading them to the cloud. It's not that I don't trust the people at Backblaze, but I like to know that nobody but me can read my data.

Duplicity uses GnuPG to encrypt backups either symmetrically or asymmetrically. I choose to use a simple passphrase to encrypt my backups. All you have to do is set a ``PASSPHRASE`` environment variable and you're done!

## Throwing it all together
After I figured out all of the options that Duplicity takes, I rewrote my backup script:

{% highlight bash %}
#!/bin/bash

# Switch to lxc-host directory which contains a
# read-only mount of my LXC containers backing store
cd /lxc-host/

# Passphrase used to encrypt backups
export PASSPHRASE="xxxxxxx"

# Backblaze B2 configuration variables
B2_BUCKET="xxxxxxx"
B2_ACCOUNT="xxxxxxx"
B2_KEY="xxxxxxx"

# Check if Duplicity is installed
if ! [ $(which duplicity 2>/dev/null) ]; then
  echo "Duplicity is not installed. Can't continue."
  exit 1;
fi

for dir in */
do
  dir=$(basename "$dir")

  echo "Starting backup for $dir ..."
  duplicity --exclude-filelist /root/exclude-backup.txt $dir b2://${B2_ACCOUNT}:${B2_KEY}@${B2_BUCKET}/$dir/ --full-if-older-than 30D --numeric-owner

  echo "Deleting old backups on B2 (>2 months old)..."
  duplicity remove-older-than 2M b2://${B2_ACCOUNT}:${B2_KEY}@${B2_BUCKET}/$dir/
done

unset PASSPHRASE
{% endhighlight %}

This shell script backs up each LXC container individually and stores these backups in my B2 account. It puts all backups of a container in it's own folder so I can easily find them. I run this backup script in a LXC container and mount the ``/var/lib/lxc`` directory of the host inside the container in read-only mode. That way I prevent the backup process from changing files in other containers. Check out [this blog post]({% link collections.posts, '2016-05-09-Getting-started-with-LXC-on-a-Scaleway-cloud-server' %}) to know more about mounting host folders in containers.

After creating the script I configured cron to trigger it every day. This is what the backups of a single container looks like after a while:

![Duplicity backup structure](/uploads/using-duplicity-backup-lxc/backup-structure.png)
*What Duplicity backups look like after a while.*

As you can see, Duplicity has created a "full" backup which contains a complete copy of my container. The subsequent days it switches to incremental backups and creates smaller files that only contain the changes.

## Summary
With Duplicity I've made my backup process simpler and more space efficient. I don't have to worry about how to take incremental backups or how to upload my files to a cloud storage providers. Duplicity handles all of this for me.

The script that I use to backup my LXC containers is available [on GitHub](https://github.com/Savjee/lxc-backup-duplicity).

Duplicity is a very versatile tool. If you're looking for more configuration options, check out their manual here: [http://duplicity.nongnu.org/duplicity.1.html](http://duplicity.nongnu.org/duplicity.1.html).