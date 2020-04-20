---
layout: post
title: "Monitoring my 3D printer with a Pi Zero, Home Assistant and TinyCore Linux"
quote: 
thumbnail: /uploads/2020-04-20-monitoring-3d-printer-pi-zero-home-assistant-tinycore-linux/poster-750.jpg
upload_directory: /uploads/2020-04-20-monitoring-3d-printer-pi-zero-home-assistant-tinycore-linux
tags: [Home Assistant, DIY, Raspberry Pi, 3D Printer]
---

Many devices in my home have become "smart" over the last couple of months, with one big exception: my trusty 3D printer. It's a super reliable Prusa i3 MK3, but it lacks an internet connection.

So I decided to use a Pi Zero to keep track of my 3D prints and send the progress to my Home Assistant installation.

<!--more-->

## What I wanted
My needs are simple: I want to grab the progress of the current print job and send that to Home Assistant. That way, I can build automations like: notify me when the printer is almost done or switch off the printer after the print completed.

More requirements that I set out:
* Has to run on a Pi Zero
* Compatible with [Prusa i3 MK3](https://shop.prusa3d.com/en/51-original-prusa-i3-mk3s)
* Non-invasive installation: there is a USB port on the Prusa. Let's use that instead of attaching stuff to the logic board.
* Monitoring only: I don't want to control the printer remotely. Let the firmware do its thing.

## Spoiler: the end result
This is what I ended up with:

![Raspberry Pi Zero monitoring Prusa i3 MK3 through the USB port](/uploads/2020-04-20-monitoring-3d-printer-pi-zero-home-assistant-tinycore-linux/prusa-i3-mk3-pi-zero-monitor.jpg)
*Raspberry Pi Zero monitoring Prusa i3 MK3 through the USB port.*

The Pi Zero is connected to the Prusa i3 via a microUSB to regular USB cable. Nice and clean!

(In reality I have the Pi tucked away underneath the table).

## OctoPrint / OctoPi
You might say: "Xavier, this already exists. It's called [OctoPrint](https://octoprint.org). They even have a special version for Raspberry Pi's that's called [OctiPi](https://octoprint.org/download/)".

And you would be right! But OctoPrint seems needlessly heavy on resources as it can't run (reliably) on a Pi Zero.

I also don't need most of the features. OctoPrint can make time lapses, keep track of temperatures, interface with a webcam, visualize GCODE, moving print head remotely, ... 

Don't get me wrong, these are all nice features, but I don't need any of them. Remotely starting a print job is cool, but I usually have to remove the previous print from the bed anyway. Interfacing with a webcam to create time lapses is impressive, but I already have an IP camera pointed at my printer.

Let's keep things simple, shall we?

## The USB serial interface
My first thought was to check if the USB serial interface on the Prusa would communicate something about its state. So I connected the printer to my MacBook and opened a serial connection.

I saw all kinds of funky messages, but as soon as I started a print, this appeared:

```
NORMAL MODE: Percent done: 1; print time remaining in mins: 13
```

Bingo! This message includes the progress of the print (in %) and the time left. Exactly what I need.

## Simply Python script
Next, I wrote [a simple Python script](https://github.com/Savjee/3dmon/blob/master/src/main.py) that opens the serial port and starts listening for messages. Each message is checked against a regex that can extract the print's progress and time left:

```
NORMAL MODE: Percent done: (.*); print time remaining in mins: (.*)
```

If a match is found, both parameters are sent to Home Assistant via the [HTTP API](https://developers.home-assistant.io/docs/external_api_rest/).

```
POST http://hassio.local/api/states/sensor.prusa_print_progress
```

```js
{
    "state": 70.3, // The percentage done
    "attributes": {
        "unit_of_measurement": "%",
        "friendly_name": "Prusa i3 MK3",
        "timeLeft": 45 // minutes left
    }
}
```

This is what the resulting entity looks like in Home Assistant:

![Prusa i3 MK3 entity in Home Assistant](/uploads/2020-04-20-monitoring-3d-printer-pi-zero-home-assistant-tinycore-linux/home-assistant-entity.png)
*Prusa i3 MK3 entity in Home Assistant*

Now that I have the data in Home Assistant, I can create a nice dashboard for my 3D printer:

![Prusa i3 MK3 entity in Home Assistant](/uploads/2020-04-20-monitoring-3d-printer-pi-zero-home-assistant-tinycore-linux/home-assistant-3d-print-dashboard.png)
*My 3D printer dashboard in Home Assistant.*


It shows the camera feed, print progress, and has a button that controls the smart switch that powers the printer (I use a TP-Link HS110).

## TinyCore Linux
I can't keep my MacBook connected to the printer, so I dusted off an old Raspberry Pi Zero. These are amazing tiny computers and more than powerful enough to keep track of my printer.

I choose to run [TinyCore Linux](http://tinycorelinux.net) on the Pi because of two reasons:

* It's incredibly lightweight. It's only 35MB in size and boots in seconds. Yep, seconds! Even on a Pi Zero.
* It boots to RAM, which means it only reads from my SD card and never writes to it.

That last one is pretty important to me. The Pi will receive power from the same smart switch that powers my printer. This one is power cycled a lot, and that tends to be an issue with Raspberry Pi's and their SD cards.

I won't go over the details on how to setup TinyCore on a Pi Zero. In a nutshell: I flashed TinyCore to an SD card, logged into it and installed the necessary dependencies through the package manager:

```
tce-load -wi firmware-rpi3-wireless.tcz 
tce-load -wi wifi.tcz
tce-load -wi python3.6
tce-load -wi pyserial
tce-load -wi usb-serial-4.9.22-piCore
tce-load -wi requests
```

Then I connected it to WiFi via the built-in `wifi.sh` script, transferred my Python script to it and edited the `/opt/bootlocal.sh` so that it automatically starts the script after booting:

```bash
# Connect to WiFi
/usr/local/bin/wifi.sh -a 2>&1 > /tmp/wifi.log

# Start 3Dmon
nohup /home/tc/main.py 2>&1 > /tmp/3dmon.log
```

## Help! My printer restarts!
With the TinyCore setup completed, I was ready to try out the whole system. I immediately hit a big problem: when my Python script attaches to the serial port, the printer reboots itself.

That could be a big issue when it happens mid-print. 

To prevent your printer from resetting when a serial connection is established, send this command over the serial port:

```
;C32u2_RMD
```

After doing that, the Pi can connect to the serial port as often as it wants. The printer won't be interrupted, and yet progress will be captured by the Python script. Awesome!

Just to be complete, here are the related commands you can send to revert the changes:

* `;C32u2_RMD` -> Disable reset on connect
* `;C32u2_RME` -> Enable reset on connect (default)
* `;C2560_RES` -> Resets the printer

I found out about these commands through [this GitHub issue](https://github.com/prusa3d/Prusa-Firmware/issues/1000).

## Creating an automation
With the Pi all set up, it was time to create an automation in Home Assistant, which notifies me whenever a print is completed:

```yaml
- alias: "[NOTIFY] When printer finishes"
  trigger:
  - platform: state
    entity_id: sensor.prusa_print_progress
    to: "100"
  action:
  - service: notify.mobile_app_iphone_van_xavier
    data:
      title: "Prusa i3 MK3"
      message: "Printer is done!"
```

And this is what it looks like on my phone:

![Home Assistant notification when 3D printer has finished](/uploads/2020-04-20-monitoring-3d-printer-pi-zero-home-assistant-tinycore-linux/home-assistant-notification.jpg)
*Home Assistant notifying me when the printer is ready for his next job.*

## Conclusion & next steps
I've been running this setup for the last couple of weeks, and it's been flawless. Not only is it simple, but it's also very reliable. None of my prints have failed because the Pi only monitors my printer. It never tries to control it. And the Pi Zero has more than enough performance 😎.

## Source code
The source code of 3dmon is available on GitHub: [https://github.com/Savjee/3dmon](https://github.com/Savjee/3dmon)

Small note: I'm not a Python developer, so the code might look atrocious. Be gentle ;)

Feel free to test it, open up issues & contribute to it.

Happy automating!