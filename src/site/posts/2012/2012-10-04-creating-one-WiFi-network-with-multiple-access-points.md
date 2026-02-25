---
layout: post
title:  How to create one WiFi network with multiple access points (same SSID)
description: "Step-by-step guide to create one WiFi network with multiple access points using the same SSID, password, and DHCP setup for seamless roaming."
quote: Have a router with limited WiFi range? Setup a second router to extend your network and great WiFi coverage.
keywords: WiFi network, extend WiFi range, one network multiple routers, access points
thumbnail: true
upload_directory: /uploads/wifi-network-multiple-access-points
meta_tags: ["WiFi network", "WiFi multiple access points", "Extend WiFi network", "WiFi repeaters", "same ssid", "multiple access points"]
---

At home, I have a problem that I know is very common: the range on our WiFi router is not enough to cover every bit of the house. (Well actually it does cover our house, but in some places it’s just painfully slow!). Luckily there are a few solutions to have WiFi everywhere.

<!--more-->

## Quick overview
Here is a quick overview of what you should do to extend your home network with a second access point:

> To extend your home network:
>
> - Connect two access points to the same network
>
> - Make sure that there is only 1 DHCP server
>
> - Use the same wireless network name (SSID) for both AP's
>
> - Use the same password and encryption settings for both AP's
>
> - Enjoy!

## Full instructions
To partially solve this problem we use a powerline to go from the front of the house to the back. There, the powerline is connected to a Dlink switch which in turn is connected to two computers over Ethernet. So far so good!

The problem now is that we can’t use our mobile devices when we’re too far away from our main WiFi basestation. I didn’t want to use an extra router because that would create a separate WiFi network and would require us to switch between networks all the time.

This problem made me wonder how my school solves it. Hogeschool Gent has multiple access points that all act as one big network. When I walk around the campus, my phone switches from AP to AP without me noticing it!

After a bit of Googling I found out that it’s really easy to create one WiFi network with multiple access points. **All you need to do is configure two routers to use the same SSID and password**.

I picked up an old Dlink DIR-635 router and began configuring it. The first thing I did was disabling DHCP and NAT on the router (bridged). This will prevent the router from making a secondary network inside the existing network. Next, I assigned an IP address to the router. My primary router has the IP address 192.168.1.1, so I gave 192.168.1.2 to my secondary router. Finally I gave both WiFi networks the same name (SSID) and set them to use the same password.

Once configured, devices connected to our WiFi network will automatically switch between routers when needed. When I move out of the range of my primary router, my iPhone or iPad switches to the secondary one. It works perfectly!

Some people would suggest buying a WiFi repeater. However, a repeater uses WiFi as backhaul and slows down every request you make. Take my phone for example: If I would use a WiFi repeater, my phone would send a request to the repeater over WiFi. The repeater would then send that same request to my primary router (again) over WiFi. This slows down transfer speeds and adds more latency. If you use a fast ethernet connection as backhaul you keep the latency low and transfer speeds high.

![Diagram of the network setup](/uploads/wifi-network-multiple-access-points/network-diagram-wifi.png)

I’ve tested this setup on a Macbook Pro (running both Windows and OS X), iPad and iPhone. All these devices switch without problem between these networks when needed. I have noticed that the iOS devices switch much quicker between AP’s then Windows or OS X machines.