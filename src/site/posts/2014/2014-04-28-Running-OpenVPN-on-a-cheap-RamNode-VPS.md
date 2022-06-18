---
layout: post
title: Running OpenVPN on a cheap RamNode VPS
keywords: OpenVPN, VPN, privacy, online, VPS, server, ramnode, protect, tunnel
quote: OpenVPN protects your privacy online. Get your own VPN running with a cheap RamNode VPS.
upload_directory: openvpn-ramnode
---

When I'm on the road and connecting to free public WiFi access points, I always use [OpenVPN](http://en.wikipedia.org/wiki/OpenVPN) to prevent my traffic from being intercepted by others. It's also very practical to circumvent the restrictive firewall at my school.

I've always used a veriety of free OpenVPN services but these are unreliable, throttle transfer speeds and usually have other restrictions. To fix this, I ordered a cheap [OpenVZ](http://openvz.org/Main_Page) based VPS from [RamNode](https://clientarea.ramnode.com/aff.php?aff=1321) to run my own OpenVPN server. In this post I'll walk you through the steps I performed to install and configure OpenVPN on Ubuntu Server 13.10

<!--more-->

I ordered the cheapest VPS that [RamNode](https://clientarea.ramnode.com/aff.php?aff=1321) has available. It has the following specs:

* 128mb RAM (with 128mb swap)
* 1 CPU core
* 10GB SSD space
* 1Gbps port
* 500GB bandwidth
* 1 IPv4 & 16 IPv6 adresses
* [Support for a wide veriaty of Linux distributions](https://clientarea.ramnode.com/knowledgebase.php?action=displayarticle&id=48)

It's an ideal server for running a personal OpenVPN server. It's cheap (only $24 for an entire year) and allows you to transfer a fair amount of data. The 10GB SSD and the 128mb RAM might seem low but it's more than sufficient for an OpenVPN server. In fact I'm also running Nginx and PHP on it without using more than 70% of the memory.

I chose Ubuntu Server 13.10 as my Linux distro as I'm already familiar with it.

## Preparations
Before you can install OpenVPN make sure your VPS is up and running. Also enable ``TUN/TAP`` and ``PPP`` in the [SolusVM Control Panel](https://vpscp.ramnode.com/). You can find these settings on the home page of the control panel under the tab 'Settings':

![Enable TUN/TAP in the SolusVM CP](/uploads/openvpn-ramnode/tuntap.png)

## Installing OpenVPN
Let's start by updating our packages and installing all updates:

{% highlight bash %}
sudo apt-get update
sudo apt-get upgrade
{% endhighlight %}

Next, we install OpenVPN and the required RSA dependencies.

{% highlight bash %}
sudo apt-get install openvpn easy-rsa
{% endhighlight %}

### Generating and configuring server certificates
OpenVPN's encryption relies on server and client certificates. So let's start by generating a certificate for the server. Copy the example config files to the correct directory:

{% highlight bash %}
mkdir -r /etc/openvpn/easy-rsa/
cp -r /usr/share/easy-rsa/* /etc/openvpn/easy-rsa/
{% endhighlight %}

Edit the file ``/etc/openvpn/easy-rsa/vars`` and configure the ``KEY_`` values:

<pre>
export KEY_PROVINCE="OV"
export KEY_CITY="Gent"
export KEY_ORG="Savjee"
export KEY_EMAIL="email@me.com"
export KEY_CN=SavjeeVPN
export KEY_NAME=SavjeeVPN
export KEY_OU=SavjeeVPN
</pre>

Now we can generate the required server certificates:

{% highlight bash %}
cd /etc/openvpn/easy-rsa/
source vars
./clean-all
./build-ca
{% endhighlight %}

Answer ``Yes`` to the questions ``Sign the certificate? [y/n]`` and ``1 out of 1 certificate requests certified, commit? [y/n]``. Next, we build the key server and generate the [Diffie Hellman](http://en.wikipedia.org/wiki/Diffie–Hellman_key_exchange) parameters:

{% highlight bash %}
./build-key-server SavjeeVPN
./build-dh
{% endhighlight %}

After this step you'll have all the required files to configure and start your OpenVPN server. All that's left is to move the keys and certificates to the OpenVPN directory:

{% highlight bash %}
cd keys/
cp SavjeeVPN.crt SavjeeVPN.key ca.crt dh1024.pem /etc/openvpn/
{% endhighlight %}


### Generating client certificates
Clients that connect to an OpenVPN server also need a key. Generate them like this:

{% highlight bash %}
cd /etc/openvpn/easy-rsa/
source vars
./build-key client1
{% endhighlight %}

Now all you have to do is download these files to the client (in a safe way!):

* ``/etc/openvpn/ca.crt``
* ``/etc/openvpn/easy-rsa/keys/client1.crt``
* ``/etc/openvpn/easy-rsa/keys/client1.key``


## Configuring routing & firewall
Since OpenVPN routes all traffic from the client through the server, we need to configure some network related stuff. First, make sure that port forwarding is enabled in the kernel. If the output of the following command is ``1`` you're all set:

<pre>cat /proc/sys/net/ipv4/ip_forward</pre>

If not, edit ``/etc/sysctl.conf`` and change these variables (a restart will be required):

{% highlight bash %}
# Packet forwarding
net.ipv4.ip_forward = 1
net.inet.ip.fastforwarding = 1
{% endhighlight %}

With port forwarding enabled, all that's left is allowing the traffic in the firewall and setting up the routing. I've combined a few guides found on the internet to come up with this bash script:

{% highlight bash %}
# OpenVPN (depending on the port you run OpenVPN)
iptables -A INPUT -i venet0 -m state --state NEW -p udp --dport 1194 -j ACCEPT

# Allow TUN interface connections to OpenVPN server
iptables -A INPUT -i tun+ -j ACCEPT

# Allow TUN interface connections to be forwarded through other interfaces
iptables -A FORWARD -i tun+ -j ACCEPT
iptables -A FORWARD -i tun+ -o venet0 -m state --state RELATED,ESTABLISHED -j ACCEPT
iptables -A FORWARD -i venet0 -o tun+ -m state --state RELATED,ESTABLISHED -j ACCEPT

# NAT the VPN client traffic to the internet
iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -o venet0 -j MASQUERADE

iptables -A OUTPUT -o tun+ -j ACCEPT
{% endhighlight %}

I placed this script on my server as ``firewall.sh`` and gave it execute permissions (``chmod +x firewall.sh``).
The script has to run every time the server boots up, so I've added it to my crontab. Run ``crontab -e`` and add something like this:

<pre>@reboot /vps.savjee.be/firewall/enable_openvpn_traffic.sh</pre>

**NOTE:** Most guides on the internet make changes to the ``eth0`` interface. However in OpenVZ the default interface is called ``venet0``.

## Configuring & starting OpenVPN
All the preparations are done! For the final step we need to create a configuration file for the OpenVPN server. Fortunately OpenVPN comes with some example config files that we can use. Copy and extract them to the correct directory:

<pre>
sudo cp /usr/share/doc/openvpn/examples/sample-config-files/server.conf.gz /etc/openvpn/
sudo gzip -d /etc/openvpn/server.conf.gz
</pre>

Now edit the ``/etc/openvpn/server.conf`` file and make sure that the name of the certificates and keys are correctly configured. In my case it looks like this:

<pre>
ca ca.crt
cert SavjeeVPN.crt
key SavjeeVPN.key
dh dh1024.pem
</pre>

Finally, we can start OpenVPN and start using it!

{% highlight bash %}
service openvpn start
{% endhighlight %}

## Performance
The performance of the small and cheap VPS surprises me. The SSD makes disk operations extremely fast. But that's not the most important aspect. I'm using the VPS as a VPN server so network throughput and latency are far more important!

To test transfer speeds I uploaded [a 100mb test file from CacheFly](http://cachefly.cachefly.net/100mb.test) to my VPS and downloaded it a few times in different locations. It consistently maxes out my home (30mbps) and school connection (30-50mbps)!

Latency is also pretty low due to the location of my VPS. I choose The Netherlands as the hosting location for my server since it's really close to where I live (Belgium). On my home connection the average ping takes 35-40ms. In comparison, pinging Google takes 30-35ms.

On my grandparents connection it's even better! Here are 5 pings to Google.be:

<pre>
64 bytes from 173.194.65.94: icmp_seq=0 ttl=47 time=18.446 ms
64 bytes from 173.194.65.94: icmp_seq=1 ttl=47 time=22.471 ms
64 bytes from 173.194.65.94: icmp_seq=2 ttl=47 time=21.515 ms
64 bytes from 173.194.65.94: icmp_seq=3 ttl=47 time=18.778 ms
64 bytes from 173.194.65.94: icmp_seq=4 ttl=47 time=21.558 ms

--- www.google.be ping statistics ---
5 packets transmitted, 5 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 18.446/20.554/22.471/1.625 ms
</pre>

Compare that to 5 pings to my VPS:

<pre>
64 bytes from 81.4.108.130: icmp_seq=0 ttl=53 time=20.499 ms
64 bytes from 81.4.108.130: icmp_seq=1 ttl=53 time=22.240 ms
64 bytes from 81.4.108.130: icmp_seq=2 ttl=53 time=21.285 ms
64 bytes from 81.4.108.130: icmp_seq=3 ttl=53 time=20.315 ms
64 bytes from 81.4.108.130: icmp_seq=4 ttl=53 time=19.239 ms

--- vps.savjee.be ping statistics ---
5 packets transmitted, 5 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 19.239/20.716/22.240/1.004 ms
</pre>

Ping times are pretty low! They're actually a bit better than Google's ping time. (Probably due to the extra time it takes to balance the load at Google?)

# Conclusion
Overall I'm very impressed with the basic VPS that [RamNode](https://clientarea.ramnode.com/aff.php?aff=1321) provides. The performance is great for running an OpenVPN server. Network throughput is high and latency is pretty low if you choose the location of your VPS wisely. And finally the price is very low. For just $24 dollars/year anyone can run an OpenVPN or simple webserver!