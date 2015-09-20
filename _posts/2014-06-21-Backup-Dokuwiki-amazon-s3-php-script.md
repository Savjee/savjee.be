---
layout: post
title: Backup DokuWiki to Amazon S3 with PHP
quote: 
upload_directory: dokuwiki-backup-s3
---

I have a small RamNode VPS that [I use as a VPN server]({% post_url 2014-04-28-Running-OpenVPN-on-a-cheap-RamNode-VPS %}). I also host my personal wiki on there and use it to document interesting things that I would otherwise forget. The information in my wiki is pretty valuable to me. I therefore decided that I needed a way to automatically backup my wiki, just in case. 

I'm a pretty big fan of Amazon S3 and what better place is there to backup your data? It's safe, secure and very cheap!

Sadly though, I couldn't find a working S3 backup script for DokuWiki that was written in PHP. The official DokuWiki websites lists [Ruby and Python scripts](https://www.dokuwiki.org/tips:backuptos3) but since I'm not familiar with those languages (and don't have them on my server) I decided to write one in PHP.

<!--more-->

Before we can start backing up to S3 we need a bucket to store our backups in!

# Creating a bucket
1. Login to the [S3 Management Console](https://console.aws.amazon.com/s3/)
2. Hit the "Create Bucket" button
3. Give your bucket a name and create it

All done! We now have a place to store our backups.

# Lifecycle rule
We don't want backups to be kept forever. In my case I want to keep 30 days worth of backups. Amazon offers Lifecycle Rules to automatically archive or remove files from your bucket after a certain amount of days.

To set them up, go to the S3 Management Console:

1. Open the Properties of your bucket
2. Expand the Lifecycle section and click "Add Rule"
![Adding a lifecycle rule](/uploads/dokuwiki-backup-s3/lifecycle-addrule.png)

3. Keep the default settings. We want this rule to be applied for the entire bucket
![Apply the rule to the entire bucket](/uploads/dokuwiki-backup-s3/lifecycle-applyrule.png)

4. I want backups to be deleted, not archived. So I selected "Permanently Delete Only" and set the days to 30.
![Delete backups](/uploads/dokuwiki-backup-s3/lifecycle-action.png)


After confirmation, your rule is added:
![Delete backups](/uploads/dokuwiki-backup-s3/lifecycle-rule.png)

# Creating new IAM user
You don't want a backup script to have full access to all your S3 buckets. To solve this problem you can create a new user that only has access to your backup bucket:

1. Go to the [IAM Console](https://console.aws.amazon.com/iam/)
2. Click on 'Users' in the sidebar
3. Hit the "Create New Users" button
4. Fill in a username and hit "Create"
5. Note the 'Access Key ID' and 'Secret Access Key', you'll need this to configure the backup script.
![IAM Credentials](/uploads/dokuwiki-backup-s3/iam-credentials.png)

Our new user is now created but has no permissions. We'll give it permission to list, upload and delete files in the backup bucket that we've created earlier.

In the IAM console:

1. Click on your created user
2. Open the "Permissions" tab and click "Attach User Policy"
![Attach policy to IAM user](/uploads/dokuwiki-backup-s3/iam-permissions.png)

3. Select the "Custom Policy" option
![Create custom IAM policy](/uploads/dokuwiki-backup-s3/iam-custompolicy.png)

4. Give your policy a name and use the following code as Policy Document (make sure to change the bucket name!):

![Custom policy](/uploads/dokuwiki-backup-s3/iam-custompolicy-filled.png)

<pre>
{
   "Version": "2012-10-17",
   "Statement": [
      {
         "Action": [
            "s3:PutObject",
            "s3:ListBucket",
            "s3:DeleteObject"
         ],
         
         "Sid": "1",
         "Resource": [
            "arn:aws:s3:::backup-vps-dokuwiki",
            "arn:aws:s3:::backup-vps-dokuwiki/*"
         ],
         
         "Effect": "Allow"
      }
   ]
}
</pre>

Apply the policy to finish!

# The script
The actual PHP script uses [PharData](http://www.php.net//manual/en/class.phardata.php) to create a tar archive for every folder you wish to backup (for DokuWiki: data/ and conf/). Those individual archives are then added to a master archive which is compressed with gzip.

Because this script uses PharData, PHP 5.3 is required! It also uses the [S3 PHP class](https://github.com/tpyo/amazon-s3-php-class).

{% highlight php %}
<?php

date_default_timezone_set('Europe/Brussels');

// Configure paths (No trailing slashes)
$tmp_backup_directory = '/vps.savjee.be/backup';
$path_to_wiki = '/vps.savjee.be/wiki';
$folders_to_backup = array('data', 'conf');

// Name of the backup file
$backup_name = 'backup-'. date('Y-m-d') .'.tar';

// Amazon S3 configuration
$s3_bucket = 'BUCKET NAME';
$s3_access_key = 'YOUR ACCESS KEY';
$s3_secret = 'YOUR SECRET ACCESS KEY';

// ------------
require 'S3.php';

try{
	$master_archive = new PharData($backup_name);
	
	// Tar each directory
	foreach($folders_to_backup as $folder){
		echo "Compressing folder $folder/ \n";
		$archive = new PharData($folder . '.tar');
		$archive->buildFromDirectory($path_to_wiki . '/' . $folder);
		
		$master_archive->addFile($folder . '.tar');
		unlink($folder . '.tar');
	}
	
	// Compress the entire master backup
	$master_archive->compress(Phar::GZ);
	
	unlink($backup_name);
}catch(Exception $e){
	echo "EXCEPTION: " . $e;
}

echo "Uploading to S3...\n";

$s3 = new S3($s3_access_key, $s3_secret);
$s3->putObject($s3->inputFile($backup_name.'.gz'), $s3_bucket, $backup_name.'.gz');

unlink($backup_name . '.gz');

echo "Done\n";
{% endhighlight %}

Using PharData is easy but has a limitation. When you archive a folder with ``buildFromDirectory()`` it archives the **contents of that folder**. So if you want to archive multiple folders (and keep the directory structure) you have to archive them separately and put them in one master archive.

If you want to contribute to this script, [fork it on GitHub](https://github.com/Savjee/dokuwiki-s3-backup)!

# Cron
The final step is to make sure that backups are taken periodically and automatically. I added a cronjob to run the script every day at 10pm:

<pre>crontab -e</pre>

<pre># Daily wiki backup
0 22 * * * /usr/bin/php /vps.savjee.be/backup/backup.php</pre>