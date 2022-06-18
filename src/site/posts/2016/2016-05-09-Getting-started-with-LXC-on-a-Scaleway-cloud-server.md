---
layout: post
title:  Getting started  with LXC on a Scaleway cloud server
quote: 
---

After waiting months for an invite, I finally got an e-mail (on my birthday!) from Scaleway telling me that I was invited to try out their cloud servers. I quickly accepted the invite, created an account, setup billing and created my first Scaleway "Starter Cloud" server. This server would replace my RamNode VPS and is going to host my Jenkins installation, a personal wiki, a VPN server and netdata.

But instead of installing everything straight onto the server, I figured it would be better to use some kind of virtualization to separate and contain each service. Full virtualization is not well supported by Scaleway and requires a lot of memory. So instead I decided to use LXC: Linux Containers. In this post I'll show you how I have configured my server with LXC, how I route traffic to containers and how I use Nginx as a reverse proxy for the containers.

<!--more-->

## The Scaleway Cloud Server
Let's first take a look at the [Scaleway offering](https://www.scaleway.com/pricing/). I ordered their most basic server and this is what you'll get for €2.99 a month:

  * 2 x86 64bit Cores
  * 2GB Memory
  * 50GB SSD Disk
  * 1 IPv4 address
  * 200Mbit/s Unmetered bandwidth

That's not bad right? Try getting a server with 2GB RAM for just €2.99 somewhere else! In fact, I was paying that exact price for a RamNode VPS with just 128mb of RAM! 

This particular Scaleway server has 2 dedicated cores of an [Intel Atom C2750](http://ark.intel.com/products/77987/Intel-Atom-Processor-C2750-4M-Cache-2_40-GHz), running at 2.4 GHz.

I opted for Ubuntu Server 14.04 as a virtualization host because it <del>is</del> was the latest LTS release. Sadly this is post is already outdated now because Ubuntu 16.04 (LTS) has been released since I deployed my server.

## What is LXC? What are containers?
Before we dive in, let's take a look at what LXC is and what it isn't. Feel free to skip this section if you already know what containers are. According to Wikipedia, LXC is:

> an operating-system-level virtualization method for running multiple isolated Linux systems (containers) on a control host using a single Linux kernel.

The term "virtualization" is a bit confusing though. Regular virtualization means that you run multiple virtual computers on a single physical computer. Each virtual machine (VM) has it's own virtual CPU, disk, network interface, ... Each VM also has it's own operating system. There is a lot of software out there that do this kind of virtualization, going from consumer grade software like Parallells and VirtualBox to enterprise software like VMware ESXi, Xen, KVM, Hyper-V.

Because each VM is essentially an entire virtual computer you can mix different kinds of operating systems. You can run a Linux virtualization host and run a Windows VM on top of it. However consider this: if all you do is run Linux based VM's, you're wasting resources. Remember, each VM has it's own proper kernel and devices. This means that you will be running multiple copies of the same Linux kernel and all of this has to be virtualized. The price? It creates some overhead and degrades performance a bit.

Containers on the other hand are much more lightweight. Each containers shares the operating system with other containers. In fact software that runs inside a container runs at near bare-metal speeds. You can compare them to sandboxes: software in containers run isolated yet directly on the hardware. 

## Benefits of containers
The benefits of using containers is comparable to the benefits of using virtual machines.

  * Each container is completely isolated from the host and from other containers. This means that if something bad happens to one container, it doesn't affect the others.

  * Isolation means: get your hands dirty. Previously I didn't install too much on my server because I didn't want to pollute the system or have compatibility issue's. With containers that issue is gone! Every time I want to experiment with something on my server, I spin up a new container and try it out. If I screw up, I simply remove the container and start over. No damage done to my host system!

But there are also benefits that are unique to containers:

  * Better performance compared to VMs. Applications in containers perform almost as fast as bare-metal installations. Yet they're still isolated. 

  * Containers boot almost instantly. When you start a VM your hypervisor has to initialize virtual hardware and then the guest OS has to be booted before your applications can run. With containers the booting process is entirely skipped and your software can start immediately.

There are however some downsides to containers:

  * You can't mix different operating systems families. You can't run a Windows container on top of Linux.

  * The security of containers can be compromised if there is a vulnerability in the kernel of the host. This could result in containers being able to exploit these vulnerabilities and harm the host. However, this is also an issue for hypervisors like Xen and ESXi. 


## Installing LXC & creating containers
Installing LXC on Ubuntu is pretty straightforward, just run:

<pre>sudo apt-get install lxc</pre>

and you're good to go. This not only installs LXC, it also sets up a network bridge that containers will use. More on that later!

Each container that you create is based on a template. Creating a container from a template is pretty time consuming and sometimes even requires additional dependencies. Instead I use the ``download`` template and specify the distribution I want to install inside the container. This template downloads pre-built container images from a central server to speed things up.

So let's start by creating an Ubuntu 14.04 container on our system:

<pre>lxc-create -t download -n myfirstcontainer -- --dist ubuntu --release trusty --arch amd64</pre>

LXC will now download the image, unpack it and initialize the container. The download will take a couple of seconds depending on the internet connection of your server.

That's actually all there is to creating a container. Now let's start our new container:

<pre>sudo lxc-start --name myfirstcontainer --daemon</pre>

Starting a container is extremely quick and barely takes a second on my Scaleway server. Remember, the container is not a full VM and doesn't have it's own kernel or virtual devices that should be initialized!

We can now go into the container and execute commands in it by attaching to it:

<pre>lxc-attach -n myfirstcontainer</pre>

Remember, when you are attached to the LXC container you are isolated from the rest of the system. Containers can't get access to processes or files from the host or from other containers.

I repeated this process a number of times and created a container for each service that I want to run on my server:

  * Wiki (PHP7 + [DokuWiki](https://www.dokuwiki.org/))
  * Jenkins (With OpenJDK)
  * Nginx as a reverse proxy for the other containers
  * BOINC (having some fun with this, crunching numbers for the [SETI@HOME project](http://setiathome.berkeley.edu/))
  * OpenVPN

I then installed the software in each container and tested it. The BOINC container worked straight away. My wiki and Jenkins installations however didn't seem to work. They weren't accessible from the internet. Why?

## LXC networking: the basics
To answer that question, I'll give you a quick overview of how networking works in LXC. When you install LXC it automatically creates a new internal network. By default this is the ``10.0.3.0`` network and it acts as a NAT bridge. Each container you create will connect to this network and because it uses NAT, every container will be able to access the internet.

![](/uploads/getting-started-lxc/lxc.png)
*The internal LXC network*

However, while containers can access the internet, they can't be accessed from the internet. If you install a web server inside a container, you won't be able to navigate to your host's IP address and expect to be greeted with a welcome message from your web server. 

It's a really nice security feature that containers offer. No matter what software you install in a container, it is always contained. You have to explicitly allow it to be accessible from the outside world. And because everything passes through your host's network card, you can centralize all the firewall stuff on the host. Block an IP on the host and your containers are automatically secured as well (assuming you have just 1 network adapter like I do). The same thing applies to rate limits.

You can compare LXC's network setup with your own home network. Your internet router also creates a NAT bridge. This allows all your devices to connect to the internet but not the other way around. It keeps them from being exposed to the open internet, only your router is exposed.

Getting back to my situation: my Jenkins container opens up port 8080 for its web interface. The Nginx container opens up ports 80 and 443. How do I make sure that these ports are accessible from the internet? We forward the ports!

## Port forwarding
With port forwarding we are essentially telling our host where it should direct traffic coming from certain ports. In this case I want to tell the host that all traffic on ports 80 and 443 should go to the Nginx container. That way Nginx can handle the incoming HTTP(S) requests.

To do this, we use ``iptables`` on the host. We tell it to forward all traffic coming from ports 80 or 443 to the same ports of the Nginx container with the IP ``10.0.3.100``:

<pre>
iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j DNAT --to 10.0.3.100:80 
iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j DNAT --to 10.0.3.100:443
</pre>

A few things to note about this command:

  * ``-i`` specifies the network interface on which this rule is applied. In my case, the host has an interface called ``eth0`` which is connected to the internet. Your interface might be named differently, so take that into account.
  * ``--dport`` specifies the port on the host that should be routed. In this case I want to accept traffic to ports 80 and 443 on the host.
  * ``--to`` specifies the IP address and the port to where you want to forward the traffic. In my case it's the IP address of the Nginx container and the same port number as the incoming traffic. Note that you can specify different ports for internal and external traffic. You could take traffic from the internet on port 1000 and route it internally to port 2000 (just to give an example).


You might notice that I don't have a port open for Jenkins or netdata. Both however expose a port to access their web interfaces. Well that's because I use my Nginx container as a reverse proxy for these services. 


## Nginx as reverse proxy for containers
Instead of letting the outside world talk directly to my Jenkins and netdata instances, I let all requests go through my Nginx container. There are a couple of reasons for this.

To start with, Nginx is a very fast web server. All calls to static resources can be handled and cached by Nginx so they won't hit the application servers. Take Jenkins as an example: the built-in Getty web server won't have to deal with static resource requests. Nginx can cache things like stylesheets, scripts and images, leaving only the dynamic parts up to the application. 

![](/uploads/getting-started-lxc/lxc-proxy.png)
*Visual representation of the reverse proxy setup I'm currently running.*

Secondly, it's more secure. Say you are making web requests directly to your containers and you want to enable SSL for all these containers. That would require you to request an SSL certificate for each container/service and configure each service to use the certificate. That's quite a hassle and I'm pretty lazy. Instead you can use Nginx as a reverse proxy that sits in front of your other containers/services. Now you let Nginx handle all the SSL related stuff. I only needed to request and install 1 SSL certificate to secure all my other containers.

Here is the example Nginx configuration for my Jenkins installation:

<pre>
location ^~ /jenkins/ {

    # Proxies all request to the IP of the Jenkins container
    proxy_pass http://10.0.3.101:8080/jenkins/;
    sendfile off;

    proxy_set_header   Host             $host;
    proxy_set_header   X-Real-IP        $remote_addr;
    proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
    proxy_max_temp_file_size 0;

    # This is the maximum upload size
    client_max_body_size       10m;
    client_body_buffer_size    128k;

    proxy_connect_timeout      90;
    proxy_send_timeout         90;
    proxy_read_timeout         90;

    proxy_buffer_size          4k;
    proxy_buffers              4 32k;
    proxy_busy_buffers_size    64k;
    proxy_temp_file_write_size 64k;
}
</pre>

With this configuration I tell Nginx that all requests to ``/jenkins/`` should be proxied to my Jenkins container. The other configuration parameters are taken from the Jenkins documentation and specify things like maximum upload size, buffer sizes and which parameters to forward.

In the same fashion I also created a reverse proxy configuration for my wiki and for netdata. After doing this, I secured all my applications with a single SSL certificate for my server. Done!

## Other configurations
You can configure a lot of different aspects of your container. LXC keeps a ``config`` file for each container. If you're looking for detailed information on all available configuration parameters, make sure to bookmark the [lxc.container.conf man page](https://linuxcontainers.org/lxc/manpages/man5/lxc.container.conf.5.html). In this section I'll only detail how you can limit container resources like CPU and memory and how you can automatically start containers when the host system boots.

The first thing I did was making sure that all my containers would start if my host system would every be restarted. It's quite essential that your server can recover from downtime without manual intervention. There are three parameters that you can configure to achieve this.

  * The first one is ``lxc.start.auto``. You can set this to either ``0`` or ``1`` and it specifies if a container should start when the system is finished booting. Naturally all my containers should start automatically so all of them have this parameter set to ``1``.
  * The second parameter is ``lxc.start.order``. This is also an integer which defines the order in which LXC should start containers.
  * Finally there is the ``lxc.start.delay`` parameter which allows you to delay the startup of a container by X number of seconds. This might be useful if there are heavy applications running in your containers that take a while to start up.

Here is an example of how you can use these parameters in the config file:

<pre>
# Start automatically on reboot
lxc.start.auto = 1

# If needed, you can define the order in which containers should boot
lxc.start.order = 3

# After starting this container, wait at least 10 seconds to start the next one
lxc.start.delay = 10
</pre>

The second thing I want to configure is the maximum amount of memory that a container can use. There are two parameters that are used to control memory limits in LXC:

  * ``lxc.cgroup.memory.limit_in_bytes`` configures the maximum amount of memory (RAM) that a container can use. 
  * ``lxc.cgroup.memory.memsw.limit_in_bytes`` configures the maximum amount of memory + swap that a container can use.

To give an example: my Jenkins container is allowed to use 750MB of RAM and a total of 1GB of memory (750MB RAM + 250MB swap). This is the configuration:

<pre>
lxc.cgroup.memory.limit_in_bytes = 750M
lxc.cgroup.memory.memsw.limit_in_bytes = 1G
</pre>

Finally it's also possible to limit containers to only use a certain number of CPU cores. This might be useful for people running heavy workloads. That way you can dedicate a couple of cores for a certain container. I don't use this on my setup and allow all containers to use both cores of my server. If you want to limit the cores you can use ``lxc.cgroup.cpuset.cpus`` to configure which cores your container can use. 

Example: suppose you have a quad-core system and you want container A to use the first two cores and container B to use the last two cores. You could configure it like this:

<pre>
# Container A can only use core number 0 and 1
lxc.cgroup.cpuset.cpus = 0,1

# Container B can use core number 2 and 3
lxc.cgroup.cpuset.cpus = 2,3
</pre>

## Backing up to Amazon S3
Another important part that I wanted to do differently with my new server was backups. Previously I had created a simple PHP script that backed up my wiki data to Amazon S3. But that was it. My config files for Nginx, OpenVPN and Jenkins data where not backed up. Thank god nothing happened to my server in the past 2 years!

This time however, I'm not leaving anything to chance. I want to **backup everything**. With LXC (and any other virtualization technology) that's actually really easy! If you backup a container you backup everything. You'll get the entire container in a tarball ready to be deployed somewhere else.

Upon looking around on the internet I found very few scripts that could take care of backing up LXC containers. I did find an article from [Jochen Breuer](https://brejoc.com/lxc_backup_with_duply/) detailing how you can backup LXC containers with Duply and create incremental backups. 

I'm a more simple guy: I want no fuss and create a complete backup of my containers every day. I'm not handling a lot of data, storage on S3 is pretty cheap and the network speed of a Scaleway VPS is so fast that even my largest backups upload in under a minute.

I started by creating a new container for my own backup service. But wait a minute, how can an isolated container take a backup of other containers? Well I mount the folder ``/var/lib/lxc/`` inside the backup container with read-only permissions. This is a folder on the host which contains the filesystems of all the containers on your system.

To mount that folder in my container, I created an empty folder in my container and named it ``lxc-host`` (being the LXC folder on the host):

<pre>mkdir /lxc-host/</pre>

After this, I went back into my host system and edited the config file of the backup container (``/var/lib/lxc/backup/config``). I added a new mount entry so that the folder ``/var/lib/lxc/`` of the host would be mounted as ``/lxc-host/`` in the backup container.

<pre>lxc.mount.entry = /var/lib/lxc lxc-host none ro,bind 0.0</pre>

I then fired up the backup container and checked if I had access to the mounted folder. All that's left to do is creating a backup script. Here is my simple LXC backup script (note that this will only work if you use LXC's default simple directory backing store):

{% highlight bash %}
cd /lxc-host/

for dir in */
do
  echo "Compressing $dir ..."
  base=$(basename "$dir")_$(date +"%Y%m%d")
  tar --numeric-owner -czf "/root/lxc-backup/${base}.tar.gz" "$dir"

  #echo "Uploading $dir to B2..."
  #b2 upload_file savjee-be-screencasts "/root/lxc-backup/${base}.tar.gz" "$base"

  echo "Uploading $dir to S3..."
  s3cmd --storage-class=STANDARD_IA put "/root/lxc-backup/${base}.tar.gz" s3://backup-lxc-container

  echo "Deleting local backup..."
  rm "/root/lxc-backup/${base}.tar.gz"
done
{% endhighlight %}

It compresses every container (even inactive ones) to a tarball and puts it in ``/root/lxc-backup/``. It then uploads the tarball to an Amazon S3 bucket with the wonderful [s3cmd](http://s3tools.org/s3cmd) tool. I originally uploaded backups to [Backblaze B2](https://www.backblaze.com/b2/cloud-storage.html) (see commented out code) but I stopped doing that because they don't (yet) have lifecycle rules. In the future I'll probably switch to B2 for all my backup needs because it's a fourth the price of S3!

## A GUI for LXC
So far I've shown you how to manage LXC container with the command line. It is also possible to manage LXC with a web interface but there are very few open source projects out there. The only working GUI I could find was [LWP or LXC Web Panel](http://claudyus.github.io/LXC-Web-Panel/). It's a web interface written in Python that allows you to create, edit, start, stop, freeze and backup containers.

The tool is fine for managing containers but in my experience it was a lot slower compared to the command line. For that reason I removed it again from my server and kept using the command line. 

![LXC Web Panel screenshot](/uploads/getting-started-lxc/screenshot-lwp.png)
*Screenshot of LXC Web panel running on my server*

I would love it if someone would pickup this project and further improve it. As far as I could tell, there aren't any other lightweight LXC web GUI's. Lightweight is key here. There are administrations panels that can manage LXC (like oVirt) but they require a lot of resources to run. That's just not worth it for a personal setup like mine.


## Wrapping up
So that's it for this post. I've showed you how I configured my new server and how I use LXC to isolate the different services I run on it. It has been a smooth experience so far. No downtime of the host since I started. As for the future: I'm considering to upgrade both the host and the containers to Ubuntu server 16.04, but let's not fix things if they aren't broken!

Using LXC means that experimenting with new software won't screw up my other services. It's far better compared to my old setup where everything was running directly on the host. In the beginning I frequently ran into trouble when I was trying stuff out. Better don't do that if you rely on the server!

And finally the backup strategy allows me to get a good night sleep, knowing that all my containers are safely backed up to Amazon and only a few clicks away from being restored if disaster would struck.