---
layout: post
title: "Secure Home Assistant Access with Cloudflare and Ubiquiti Dream Machine"
quote:
tags: [Home Assistant, Smart Home, Ubiquiti]
thumbnail: /uploads/2020-12-12-secure-home-assistant-access-with-cloudflare-and-ubiquiti-dream-machine/thumb_timeline.jpg
upload_directory: /uploads/2020-12-12-secure-home-assistant-access-with-cloudflare-and-ubiquiti-dream-machine
---

I've become increasingly reliant on Home Assistant to automate various tasks around the house. But how do you safely expose your instance to the internet for remote access?

You want to be able to log in from a remote location, but how to keep others out? This post will show how I'm using Cloudflare and the Ubiquiti Dream Machine to properly secure my setup on multiple levels.

<!--more-->

To follow along with this post, I assume that you have:

* a Home Assistant installation
* a domain name that's linked to Cloudflare
* a Ubiquiti firewall product like the Dream Machine or USG. (Other firewalls will also work, but I provide no examples)

## High-level overview
Here's what I'll explain:

* Configure Cloudflare certificates (strict security between Cloudflare and your Home Assistant server)
* Use the Nginx add-on for Home Assistant to work with Cloudflare
* Add a firewall rule to the Dream Machine to only allow Cloudflare to access my Home Assistant instance

## Cloudflare setup
Cloudflare is a CDN that puts itself between a visitor and your origin server (in this case Home Assistant). The connection between the visitor and Cloudflare will automatically be secured with HTTPS. 

However, since Home Assistant runs on unencrypted HTTP, that traffic will be unencrypted. Allowing third-parties to potentially eavesdrop on the unencrypted part.

![Cloudflare setup without origin certificates](/uploads/2020-12-12-secure-home-assistant-access-with-cloudflare-and-ubiquiti-dream-machine/cloudflare-no-origin-certificates.png)
*Cloudflare setup without origin certificates*

What we want is encrypted traffic between visitors and Cloudflare and between Cloudflare and Home Assistant. This way, nobody can eavesdrop on your traffic.

![Secure Cloudflare setup with origin certificates](/uploads/2020-12-12-secure-home-assistant-access-with-cloudflare-and-ubiquiti-dream-machine/cloudflare-with-origin-certificates.png)
*Secure Cloudflare setup with origin certificates*

To set this up, we have to use the "Origin certificates" feature of Cloudflare:

1. Head over to Cloudflare, and click on your domain. 
Navigate to "SSL/TLS" > Origin Server > Create Certificate
![Cloudflare: create certificate](/uploads/2020-12-12-secure-home-assistant-access-with-cloudflare-and-ubiquiti-dream-machine/cloudflare-create-certificate-1.png)

2. In the popup, let Cloudflare generate a private key for you. Your domain name will be pre-filled. I chose to make the certificate valid for 15 years for my own convenience. 
Remember: this certificate is only used to protect traffic between Cloudflare and your Home Assistant install. Traffic between you and Cloudflare will be secured with short-lived SSL certificates.
![Cloudflare: origin private key and certificate](/uploads/2020-12-12-secure-home-assistant-access-with-cloudflare-and-ubiquiti-dream-machine/cloudflare-create-certificate-2.png)
 
3. Go to the next step. Cloudflare will present you with an origin certificate and private key.
4. Save the "Origin Certificate" to a file called `cloudflare.pem`
5. Save the "Private key" to a file called `cloudflare.key`

Now upload both these files to the `/ssl` folder on your Home Assistant server (via SSH or via Samba). 
![SSL folder on my Home Assistant server](/uploads/2020-12-12-secure-home-assistant-access-with-cloudflare-and-ubiquiti-dream-machine/cloudflare-ssl-certificates-on-home-assistant.png)

The last step is to enable strict encryption mode in Cloudflare.

1. Head over to SSL/TLS > Overview
2. Select "Full (strict)"
![Cloudflare: enable full strict mode (SSL certificate)](/uploads/2020-12-12-secure-home-assistant-access-with-cloudflare-and-ubiquiti-dream-machine/cloudflare-strict-mode.png)

Cloudflare will now encrypt traffic between itself and your Home Assistant installation. It will also verify the identity of your server.

Note: this will temporarily break your Cloudflare setup because your Home Assistant server is not encrypting its traffic with the certificate we got from Cloudflare. We'll fix that in the next step!

## Configuring Nginx on Home Assistant
Home Assistant has no built-in options to serve traffic over HTTPS. So we have to use Nginx as a reverse proxy that sits between Cloudflare and your unencrypted Home Assistant instance. It'll handle all the encryption.

1. Head over to your Home Assistant installation.
2. Go to "Supervisor" > "Add-on Store" and install the  "NGINX Home Assistant SSL proxy" add-on.
![How to install Nginx add-ons for Home Assistant](/uploads/2020-12-12-secure-home-assistant-access-with-cloudflare-and-ubiquiti-dream-machine/home-assistant-nginx-1.png)

3. Open the "Configuration" tab of the Nginx add-on and configure it as shown below:
![Configure Nginx add-ons for Home Assistant and use with Cloudflare](/uploads/2020-12-12-secure-home-assistant-access-with-cloudflare-and-ubiquiti-dream-machine/home-assistant-nginx-2.png)

Make sure to set your domain and configure your SSL keys correctly. 

As a bonus: set `cloudflare` to `true`, and Nginx will block all traffic not coming from Cloudflare. Cool!

```yaml
domain: your-domain-name.com
certfile: cloudflare.pem
keyfile: cloudflare.key
cloudflare: true
```

Start (or restart) the Nginx add-on after you've made these changes.

## Port-forwarding
You will need to open up some ports on your modem/router for this all to work. I won't provide detailed instructions on this since it's highly specific to your setup.

In my case, I run a Ubiquiti Dream Machine behind my ISP's modem. So I have to open up ports on both of these and make sure they match.

![Port-forwarding rules to make my Home Assistant accessible while away from home.](/uploads/2020-12-12-secure-home-assistant-access-with-cloudflare-and-ubiquiti-dream-machine/network-setup-routers.png)
*Unfortunately I can't get rid of my ISP's modem because it's required by their IPTV infrastructure.*

```
Internet -> Modem (port 2096) -> Dream Machine (port 2096) -> Home Assistant server (port 443)
```

## Ubiquiti Dream Machine: firewall setup
Now you have successfully secured the connection between Home Assistant and Cloudflare. But nothing is preventing an attacker from directly connecting to your instance.

(Technically, Nginx will filter out that traffic, but we can add a secondary layer of protection. Just in case there's a security issue with Nginx.)

The port forwarding rule doesn't care about who is sending traffic. Time to set up a firewall rule!

![An attacker can still bypass Cloudflare if he knows your IP address](/uploads/2020-12-12-secure-home-assistant-access-with-cloudflare-and-ubiquiti-dream-machine/cloudflare-indirect-attacker.png)
*An attacker can still bypass Cloudflare if he knows your IP address*

First, we'll define 3 groups in Unifi:

* An IP group with Cloudflare's IP ranges
* An IP group with the IP address of your Home Assistant server
* An port group containing all the exposed ports of your Home Assistant box (only 1)

To create a group in your Unifi controller, head over to Settings > Security > Internet Threat Management > Firewall > Create New Group.

![Unifi: How to create a new IP/port group](/uploads/2020-12-12-secure-home-assistant-access-with-cloudflare-and-ubiquiti-dream-machine/unifi-firewall-rules-1)


Let's start by creating a group containing all Cloudflare IP addresses. Luckily, [they publish a list](https://www.cloudflare.com/ips/) of used IP ranges. (Unfortunately, there's no way to keep this up-to-date automatically. So you might have to check back on this list in the future).

![Unifi: IP group with Cloudflare ranges](/uploads/2020-12-12-secure-home-assistant-access-with-cloudflare-and-ubiquiti-dream-machine/unifi-firewall-rules-2.png)

Next: a group containing the local IP address of your Home Assistant server.

![Unifi: IP group with my Home Assistant server](/uploads/2020-12-12-secure-home-assistant-access-with-cloudflare-and-ubiquiti-dream-machine/unifi-firewall-rules-3.png)
*If you have more servers exposed to Cloudflare, you can add them here.*

And finally, a group containing all the ports that should be blocked for everyone, except Cloudflare. I'm only using port 2096, so that should suffice. However, to be on the safe side, I also blocked other web server ports.

![Unifi: Port group with all exposed ports](/uploads/2020-12-12-secure-home-assistant-access-with-cloudflare-and-ubiquiti-dream-machine/unifi-firewall-rules-4.png)

Now you're ready to create the firewall rules. 

The first rule will allow incoming traffic from Cloudflare (towards the Home Assistant server).
	
* Type: Internet In
* Rule applied: before
* Action: Accept
* Source
	* Source Type: Address/Port Group
	* IPv4 Address group: cloudflare_ipv4 (the group you made before, containing all Cloudflare IP ranges)
	* Port Group: any
* Destination
	* Destination Type: Address/Port Group
	* IPv4 Address Group: home-assistant-server (the group containing the IP address of your Home Assistant server)
	* Port Group: home-assistant-exposed-port (the group containing all exposed ports on your Home Assistant server)

![Unifi firewall rule that allows traffic from Cloudflare](/uploads/2020-12-12-secure-home-assistant-access-with-cloudflare-and-ubiquiti-dream-machine/unifi-firewall-rules-5.png)
*Firewall rule to allow traffic originating from Cloudflare*

The second rule will block all other traffic:

* Type: Internet In
* Rule applied: before
* Action: Drop (or deny)
* Source
	* Source Type: Address/Port Group
	* IPv4 Address group: any
	* Port Group: any
* Destination
* Destination Type: Address/Port Group
* IPv4 Address Group: home-assistant-server (the group containing the IP address of your Home Assistant server)
* Port Group: home-assistant-exposed-port (the group containing all exposed ports on your Home Assistant server)

![Unifi firewall rule to block all other traffic](/uploads/2020-12-12-secure-home-assistant-access-with-cloudflare-and-ubiquiti-dream-machine/unifi-firewall-rules-6.png)
*All other traffic should be blocked! You shall pass through Cloudflare.*

All done! Nobody outside Cloudflare can directly access your Home Assistant instance.

![Overview of the 2 firewall rule in Unifi](/uploads/2020-12-12-secure-home-assistant-access-with-cloudflare-and-ubiquiti-dream-machine/unifi-firewall-rules-overview.png)
*Overview of the 2 firewall rule in Unifi*

## Testing
Time to test the firewall rules. At this point, you should be able to access your Home Assistant instance through your Cloudflare domain.

Next, I tried connecting to my remote IP address from my phone's 4G connection. No response. Good!

One final test: I logged into a remote server and tried to download my Home Assistant webpage with wget:

```
wget https://MY_IP_ADDRESS:2096 --no-check-certificate
```

The request just hangs and times out because the firewall dropped the packets.

```
--2020-12-12 13:26:18--  https://XX.XXX.XXX.XXX:2096/
Connecting to XX.XXX.XXX.XXX:2096... failed: Connection timed out.
Retrying.
```

## Cloudflare firewall
Now that all your traffic runs through Cloudflare, you can use their firewall to block traffic as well. In my case: any traffic that comes from outside Belgium is unwanted. 

So I'll block that:

![Cloudflare firewall rule to block traffic from outside Belgium](/uploads/2020-12-12-secure-home-assistant-access-with-cloudflare-and-ubiquiti-dream-machine/cloudflare-firewall-outside-belgium.png)
*You can't allow the whole world into your home.*

This rule is currently blocking about 10-50 requests from other countries:

![Cloudflare firewall logs](/uploads/2020-12-12-secure-home-assistant-access-with-cloudflare-and-ubiquiti-dream-machine/cloudflare-firewall-logs.png)
*Nice try!*


## Ultra secure: Cloudflare Access + Cloudflare Argo Tunnel
Want more security? 

You could add [Cloudflare Access](https://www.cloudflare.com/teams/access/) to add a secondary authentication layer on top of Home Assistant's login system.

And if you feel uncomfortable with opening ports on your network, you can use [Cloudflare Argo Tunnel](https://www.cloudflare.com/products/argo-tunnel/) to set up a tunnel between you and Cloudflare. No ports to open! It does cost $5/month, but that might be worth it to you.

## Bonus: using Cloudflare as Dynamic DNS provider
At this point, I'm pretty reliant on Cloudflare to secure my Home Assistant installation. But you can also use it as a dynamic DNS provider! Ideal for when you don't have a fixed IP address at home.

Instructions on how to set it up: [https://www.home-assistant.io/integrations/cloudflare/](https://www.home-assistant.io/integrations/cloudflare/)

## Final result
This is how I've organized external access to my Home Assistant installation:

![Final setup with Cloudflare & Ubiquiti Dream Machine](/uploads/2020-12-12-secure-home-assistant-access-with-cloudflare-and-ubiquiti-dream-machine/final-setup.png)
*Final setup with Cloudflare & Ubiquiti Dream Machine*

Let me know if you have any feedback or experiences with securing your setup!
