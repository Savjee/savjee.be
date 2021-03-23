---
layout: post
title:  Building a Hackintosh
quote: After 3 years of using my Macbook I wanted a new computer. The price of a Mac Pro is insane so I builded a much cheaper Hackintosh with great specs.
keywords: Building Hackintosh, OS X on a PC, OSX86
thumbnail: true
upload_directory: /uploads/building-hackintosh
---

In 2009 I bought the first Unibody Macbook Pro (Macbook pro 5,1) as a replacement for my four year old PowerBook G4. I’ve used it ever since and absolutely love the machine! Over the years I’ve added more memory and took the SuperDrive out to make room for a SSD.

After 3 years my Macbook is still fast but it can’t handle recent games. I decided to look for an affordable new computer to replace the Macbook for when I’m home. While I was looking for advice on Youtube, I found [this](https://www.youtube.com/watch?v=0-1zxBI42JI) video of [Bob Roche](https://www.youtube.com/user/cpukid00) talking about his Hackintosh. I started to look more into the Hackintosh scene and ultimately decided to go for it and build myself a Hackintosh!

<!--more-->

# Hardware
When you decide to build a Hackintosh, the components are the most important aspect of the build. Not every piece of hardware works with OS X. Remember that OS X was designed to run on Apple’s own hardware. Since this was my first build, I decided to buy components that where recommended by the [tonymacx86](https://www.tonymacx86.com/) community. Here’s the list:

* Case: Antec Sonata IV with 620W power supply
    * (I don’t recommend this case! Why is explained later in the post)
* Motherboard: Gigabyte GA-Z77-DS3H
* CPU: Intel Core i5 3570K (4×3.4 GHz)
* RAM: 16GB Crucial DDR3 1333MHz
* HDD: Seagate Barracuda 2TB (refurbished)
* SSD: Crucial M4 64GB
* WiFi: TP-Link TL-WDN4800 (450Mbps, Dual-band)
* Bluetooth: Belkin Bluetooth dongle

I decided not to buy a GPU because they’re expensive and I didn’t know if the Hackintosh would actually work. The Intel Core i5 has built-in HD4000 graphics and I figured it would be sufficient to start.

I can’t stress this enough: do research before buying components. Verify that everything works under OS X before you buy. That way, you save yourself money and a ton of headaches!

# The install
I’m not going to describe every single detail of the installation. There are a lot of great guides out there that explain how to install OS X on your Hackintosh. Since Apple only distributes OS X through the Mac App Store you will need access to a real Mac. On that Mac, you have to download a copy of OS X from the [App Store](https://itunes.apple.com/us/app/os-x-mountain-lion/id537386512?ls=1&mt=12), download and run [UniBeast](https://www.tonymacx86.com/resources/categories/tonymacx86-downloads.3/) and follow the on-screen instructions. It’s really easy! You’ll end up with a bootable USB drive that you can use to boot up your Hackintosh. Ready to install OS X!

In my case, the installation took about 20 minutes and ran without problems!

# Drivers
After you’ve installed OS X, you will need to install a few extra drivers and a bootloader. It’s sounds complicated but it’s really easy with Multibeast, another free tool from the tonymacx86 community. Which drivers to install depend on your hardware. In my case only sound and ethernet drivers where needed to get everything working. I also installed FakeSMC to get access to the temperature sensors of the motherboard and CPU. Here are the Multibeast settings that I’ve used:

![Multibeast screenshot](/uploads/building-hackintosh/multibeast.jpg)

# Graphics
I was a little worried about the integrated Intel HD4000 graphics. I wondered if I could use it with my dual monitor setup. I have two LG IPS235 monitors that run at a resolution of 1920×1080. As it turns out, the HD4000 has no problems with that at all! I connected one display with HDMI, the other with DVI. That’s it! OS X detected the two monitors in a second and I was on my way!

Performance of the integrated GPU is good, but not mind blowing. 1080p video’s play without a problem and if you don’t want killer graphics you can play modern games on it. I’ve played Call of Duty Black Ops 2 and Assassin’s Creed 3 on the HD4000. The games run smoothly but you have to turn down the graphics a bit.

![Graphics screenshot](/uploads/building-hackintosh/about-this-mac-displays.jpg)

# Speed, stability and updates
My “Mack Pro” is a big improvement over my Macbook Pro in terms of speed. It isn’t a fair comparison, but still. Stability is something a lot of people worry about when considering building a Hackintosh. My Hackintosh is rock-solid, just like a real Mac. Haven’t got a single kernel panic or freeze.

Updating OS X on a Hackintosh can be tricky sometimes. I originally installed 10.8 on my machine and I had no issue’s updating to 10.8.1. The next update, 10.8.2, overwrote my audio driver and I had to reinstall it. Updating is usually not a big deal but it can cause issue’s on certain hardware configurations. It’s better to consult tonymacx86 before updating your machine.

[This](http://browser.primatelabs.com/geekbench2/1459312) is the Geekbench score of the machine. It’s not the fastest around but an enormous improvement over the 3000 points that my Macbook scores.

# The bad
I’ve been using my Hackintosh practically every day since I built it. The machine is very capable and I don’t regret building it. However, my biggest mistake with this build is the case. While the Antec Sonata IV is a quiet case, it’s far from practical. It has no cable management and you’ll end up with a mess of cables inside the case.

There are a ton of cases out there that are quiet and yet practical. I’m looking to buy a new case such as the [Fractal Design Define R4](http://www.fractal-design.com/?view=product&prod=99). I’ll update this post when I get a new case and add some pictures of it.

# Conclusion
Building a Hackintosh is not so easy and requires time and patience. I therefore only recommend it to people who have builded a computer before or have some IT knowledge. It’s not extremely difficult but it’s not easy either.

![About this Mac Screenshot](/uploads/building-hackintosh/about-this-mac.jpg)