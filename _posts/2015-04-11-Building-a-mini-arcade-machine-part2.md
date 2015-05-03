---
layout: post
title:  Building a Mini Arcade Machine (Part 2)
quote: 
thumbnail: uploads/mini-arcade-pt2/thumb.jpg
upload_directory: mini-arcade-pt2
---

About a month ago I started building a mini arcade machine. A lot has happened since my first post. In the last couple of weeks my girlfriend and I sanded and painted all the wood panels. This last weekend we put the panels together and wired all the buttons, LEDs and joysticks. We slowly watched our arcade machine come to life!

<!--more-->

# Putting it together

## Wood
Putting the painted pieces of wood together wasn't very difficult. We got a lot of help from my father in law. Practically all pieces are screwed on to both sides of the arcade. This ensures that everything is strong and can stand up to a beating if someone loses a game!

![](/uploads/mini-arcade-pt2/wood.jpg)

## Wiring the buttons & LEDs

Before we started inserting the buttons in the holes, I checked if all LEDs where working. I also indicated the polarity of the LED's on the connectors. That way I knew where the positive and negative leads should go.

![](/uploads/mini-arcade-pt2/buttons_joystick.jpg)

The LEDs need to be wired in parallel. I wired up all the LEDs using the included daisy chained ground wire. Be careful though! The wire included with this kit is intended to wire things in series, not parallel! Connecting the LEDs in parallel with this wire results in a short circuit. I needed some time to actually figure this out. I thought that everything in this kit was ready to go and was a little hesitant to cut the wire in half. Luckily though, my basic knowledge of electricity helped me out.

![](/uploads/mini-arcade-pt2/wiring_buttons.jpg)

Getting everything connected in the cabinet was a bit of a pain because we had already assembled the entire arcade. Some buttons where hard to reach and each button needs 4 wires! Putting the joysticks in was also difficult because we had to put a bolt on each screw from inside the cabinet. Conclusion? We should have wired everything up before assembling the entire cabinet!

Luckily though the wiring itself is pretty easy and straightforward. I connecting the buttons randomly to the different ports on the USB controller. How you wire the buttons isn't really important since they have to be configured later on. You do have to pay a little more attention to the joysticks though. They should be wired to one of two ports on the USB controller.

# VGA to HDMI
In the previous post I installed and configured RetroPie on my Raspberry Pi. I hooked up the Pi to my television with HDMI and tested if everything worked correctly. Everything worked great!

Last weekend however, I connected the Pi to the old VGA display in the cabinet. After booting up the Pi, the screen came on but displayed nothing. Complete darkness. Obviously the problem had to be related to the HDMI to VGA converter. As it turns out, I needed to enable HDMI safe mode to get the picture up and running.

So I ssh'ed into the Pi, edited the ``/boot/config.txt`` file and uncommented this line:

<pre>
hdmi_safe=1
</pre>

After a reboot, the screen turned on and I was greeted by EmulationStation's splash screen.

# Configuring RetroArch & EmulationStation
After finishing the wiring and the cabinet, we couldn't wait to play games! Before you can play you need to configure the joysticks and buttons. RetroPie ships with RetroArch, a development interface for game emulators. It allows you to configure your input method once and then use it across all supported game emulators. Neat!

To configure the buttons and the joysticks I needed to know the ID's of each button. To get this, I fired up ``jstest`` with this command:

{% highlight bash %}
jstest –event /dev/input/js0
{% endhighlight %}

This little utility shows all the inputs on the screen and shows their current state. I pressed each button and noted the ID of each of them. After this I edited the retroarch config file and configured the buttons. The config file is located here: ``/opt/retropie/configs/all/retroarch.cfg``. Here's my config file:

<pre>
input_player1_joypad_index = 0
input_player1_a_btn = 13
input_player1_b_btn = 10
input_player1_y_btn = 21
input_player1_start_btn = 12
input_player1_up_axis = +3
input_player1_down_axis = -3
input_player1_left_axis = +2
input_player1_right_axis = -2

input_player2_joypad_index = 0
input_player2_a_btn = 0
input_player2_b_btn = 9
input_player2_y_btn = 2
input_player2_start_btn = 12
input_player2_up_axis = -1
input_player2_down_axis = +1
input_player2_left_axis = -0
input_player2_right_axis = +0
</pre>

Note that this won't work for every setup. It depends on how you wired the buttons on to the USB interface. I also configured a hotkey that allowed me to exit a running game and return to EmulationStation. To do that, I specified a hotkey button and an exit button (my start and select buttons). So when I press both at the same time, the game exits and I return to EmulationStation!

<pre>
input_enable_hotkey_btn = 12
input_exit_emulator_btn = 6
</pre>

# Fixing the autofire problem
After configuring both RetroArch and EmulationStation I stumbled upon a weird issue. When you move one of the joysticks in a particular direction it autofires. The pi thinks I'm rapidly moving the joysticks in one particular direction instead of just holding it down. This caused all sorts of issue's. Some games where very hard to play because of it. Also navigating around EmulationStation was so fast that I jumped up and down the list of games.

I confirmed the problem by running ``jstest –event /dev/input/js0``. When moving the joystick down, it fills the screen with events. This should trigger just one event!

I probably spend an hour researching this issue and ultimately found [a thread on the RetroArch forums](http://blog.petrockblock.com/forums/topic/autofire-on-the-axis/) that described my issue. The solution is to apply a patch to the Linux kernel. Luckily for me, the author of the post solved his own issue and compiled a custom kernel. All I needed to do was download his kernel and run his ``install.sh`` file.

I downloaded the kernel from [his Dropbox](https://www.dropbox.com/s/oobz4e58r0afhwf/custom_kernel_1.20150216-1.tar.gz?dl=0) and transfered it to the Pi over SFTP. Now all that's left is extracting the tar.gz file and running the install script:

{% highlight bash %}
tar xf custom_kernel_1.20150216-1.tar.gz
cd custom_kernel_1.20150216-1
sudo ./install.sh
{% endhighlight %}

After installing the kernel, the script prompted me to reboot my Pi. I confirmed by typing 'Y' and a few minutes later the Pi had restarted into the new kernel. Autofiring problem: solved!

# Finding great multiplayer games
When you're building a 2-player arcade you obviously want some multiplayer games on it! I searched around on the internet and found some fun multiplayer games. Here's the short list of co-op games we currently play:

For NES:

* [Ice Climber](http://en.wikipedia.org/wiki/Ice_Climber)
* [Bubble Bobble](http://en.wikipedia.org/wiki/Bubble_Bobble)
* [Tetris (Atari)](http://en.wikipedia.org/wiki/Tetris_%28Atari%29)
* [Yoshi](http://en.wikipedia.org/wiki/Yoshi_%28video_game%29)

For SNES:

* [Ms. Pac-Man](http://en.wikipedia.org/wiki/Ms._Pac-Man)
* [Super Bomberman 3](http://en.wikipedia.org/wiki/Super_Bomberman_3)

For SEGA Genesis:

* [Sonic the Hedgehog 2](http://en.wikipedia.org/wiki/Sonic_the_Hedgehog_2)
* [Zombies Ate My Neighbors](http://en.wikipedia.org/wiki/Zombies_Ate_My_Neighbors)
* [Mortal Kombat](http://en.wikipedia.org/wiki/Mortal_Kombat_%281992_video_game%29)

Definitely leave a comment if you know another great multiplayer game for any of those classic game consoles!

# The finished arcade
Here is the finished arcade in action:

<a href="http://imgur.com/X9TuKxm"><img src="http://i.imgur.com/X9TuKxm.gif" title="source: imgur.com" /></a>

And here are some more pictures:

![](/uploads/mini-arcade-pt2/final_1.jpg)

![](/uploads/mini-arcade-pt2/final_2.jpg)

![](/uploads/mini-arcade-pt2/final_3.jpg)


# Conclusion
This was probably one of the coolest projects I ever did! I usually spend my free time developing software, not sawing wood. I never created something physical like this before. It required not only my IT skills but also my handyman skills!

We're both very happy with how the arcade turned out. We'll continue to tweak it in the future. We want to add a nice marquee, make a better support for the screen, add more games and hold a game tournament with friends!

![](/uploads/mini-arcade-pt2/arcade_at_night.jpg)
