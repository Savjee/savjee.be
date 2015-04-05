---
layout: post
title:  Building a Mini Arcade Cabinet (Part 1)
quote: 
thumbnail: uploads/mini-arcade/thumb.jpg
---

I'm a geek. I like geeky stuff. For the past couple of months I was looking for a reason to buy myself a Raspberry Pi. I thought about integrating it in my room and in my car. I thought about creating an internet radio with it or just use it as a home server.

But when I came across the Internet Archive's [Internet Arcade](https://archive.org/details/internetarcade), I finally decided what my first Raspberry Pi project was going to be: building an arcade cabinet! My girlfriend and I started working on the arcade this weekend and we intent to continue to work on it during the weekends. In this post I walk you through everything we did during our first build weekend!

<!--more-->

![Raspberry Pi with two arcade buttons](/uploads/mini-arcade/p1_rpibuttons.jpg)

# The design

![Sketch of the mini arcade cabinet](/uploads/mini-arcade/p1_arcade_sketch.png)

I didn't want to build a full scale arcade cabinet since they take up a lot of space. I found several projects online of smaller, bartop arcade cabinets. We looked at several designs but ultimately decided to follow [this great Instructable](http://www.instructables.com/id/2-Player-Bartop-Arcade-Machine-Powered-by-Pi/). It's a very well written post with drawings and dimensions of the wood panels.


# Parts & costs
Most of the budget for the arcade went to the arcade joysticks, the buttons and the Pi. I ordered the new [Raspberry Pi 2](http://www.raspberrypi.org/products/raspberry-pi-2-model-b/) as brain for my machine. It has a faster and more compatible processor then it's predecessor. The Pi will be connected to an old 19" display with built-in speakers. 

Finding joysticks and buttons for the arcade was a little bit more difficult. I couldn't find any retailers that shipped these components to Belgium for a reasonable price. Most of them don't ship to Belgium or charge a ridiculous amount of money for it. 

I settled for the ["Chrome effect" button set from Ultracabs](http://www.ultracabs.co.uk/usb-interface--chrome-effect-joystick-set-110-p.asp). The set includes 2 classic joysticks, 12 buttons with LED backlight, 12 microswitches, a USB controller and all the wires you need. This was by far biggest cost of this project. There is a cheaper option available but that doesn't include the LEDs (I had to had them!). Check out all the goods that come with this kit:

![All components included in the Ultracabs set](/uploads/mini-arcade/p1_parts.jpg)

I choose to use MDF wood for the enclosure of the arcade. MDF is relatively cheap, pretty strong and not too heavy. It's also supposed to be very easy to paint if you use a good primer. 

Here's the complete price list of the project:

<table class='pure-table pure-table-bordered pure-table-striped'>
	<tr>
		<th>Item</th>
		<th>Price</th>
	</tr>
	<tr>
		<td>Raspberry Pi 2</td>
		<td>€46,18</td>
	</tr>
	<tr>
		<td>Power supply</td>
		<td>€6,89</td>
	</tr>
	<tr>
		<td>16GB Micro SD Card</td>
		<td>€6,43</td>
	</tr>
	<tr>
		<td>HDMI to VGA adaptor</td>
		<td>€6,33</td>
	</tr>
	<tr>
		<td>Ultracabs Kit</td>
		<td>€66,18</td>
	</tr>
	<tr>
		<td>Wood</td>
		<td>€18,95</td>
	</tr>
	<tr>
		<td>Paint</td>
		<td>?? (didn't buy yet)</td>
	</tr>
</table>

(I already owned a 12V power supply for the LED's and an old 19" screen with built-in speakers.)

# Drilling & sawing the control and side panels
My arcade machine is intended for 2 players so I need cutouts for 2 joysticks and 12 buttons. After drilling the holes I tested if everything fits:

![The arcade's control panel](/uploads/mini-arcade/p1_controlpanel.jpg)

The side panels require a bit more work. We sketched both side panels on a piece of wood and used a piece of string to draw to curve. Afterwards I cut out the curve with a jigsaw.

![Sawing the sidepanels](/uploads/mini-arcade/p1_cuttingSidepanels.jpg)

Working out the rough edges with a rasp:
![Rasping the sidepanels](/uploads/mini-arcade/p1_sidepanel_rasp.jpg)

We didn't just cut the side panels and control panel. The front panel, marquee and bottom are also finished. Only the screen cutout and back panel remains. That's for next weekend ;).

# Setting up the Pi
I started setting up the Raspberry Pi in between the wood sawing sessions. I found two operating systems for the Pi that are built for emulating classic games: [PiPlay](http://pimame.org/) and [RetroPie](http://blog.petrockblock.com/retropie/). Both have about the same features and come with support for many emulators. I choose RetroPie because it had a stable build for the Raspberry Pi 2 (PiPlay for the Pi 2 was in beta). 

RetroPie can be used to emulate many game systems including: MAME (for all those classic arcade games), NES, SNES, GameBoy and PlayStation 1. Check out the full [list of supported systems](http://blog.petrockblock.com/retropie/arcade-systems-game-consoles-and-home-computers-in-retropie/).

I downloaded the RetroPie ISO from [the official website](http://blog.petrockblock.com/retropie/retropie-downloads/) and flashed it on my MicroSD card with [ApplePi Baker](http://www.tweaking4all.com/hardware/raspberry-pi/macosx-apple-pi-baker/). This is a free utility for OS X that eliminates the use of a terminal for flashing ISO images. It takes the hassle out of using ``dd``.

![Screenshot of ApplePi Baker](/uploads/mini-arcade/p1_applepibaker.png)


After flashing the ISO, I connected the Pi to my display, hooked it up to the internet and fired it up. The boot process takes about 30 seconds and boots directly into Emulation Station. Pretty much everything works out of the box but it requires some manual actions.

First of all we need to increase the size of the root partition. After the initial setup you're limited to about 1GB even if your SD card is bigger. 

  * Start by running ``sudo raspi-config`` to enter the configuration utility. 
  * From there select ``expand_rootfs``
  * Reboot your Pi

Now that we've got some free space on the SD card, update all packages on the system:

{% highlight bash %}
sudo apt-get update
sudo apt-get upgrade
{% endhighlight %}

Afterwards run the RetroPie Setup script to download the available emulators from the web:

{% highlight bash %}
cd RetroPie-Setup
sudo ./retropie_setup.sh
{% endhighlight %}

Almost done! The final step is to download some game roms for the arcade. You can transfer the ROMs via SFTP to the Raspberry Pi. Login with user ``pi`` and password ``raspberry``. Roms should be placed in the  ``~/RetroPie/roms/`` directory.

That's it! Start Emulation Station, select the system you want to emulate, select your game and start playing with your keyboard! I'll connect the buttons and joysticks later on when the enclosure is nearly finished. 

![Screenshot of Emulation Station](/uploads/mini-arcade/p1_emulationstation.png)

# Work in progress...
See you in the next post!