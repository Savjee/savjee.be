---
layout: video
collection: videos
title: "Why ESP32's Are the Best Microcontrollers"
videoId: A5CB4t9sukM
order: 1
series: Programming ESP32 with Arduino
uploadDate: 2020-05-22
not_featureable: true
---

In this video I want to go over some of the reasons why - in my opinion - the ESP32 is an incredible microcontroller and why you should use in your IoT projects.

In a nutshell:

* Dual-core CPU (clocked at 80, 160 or 240MHz)
* ULP: Ultra Low Power Co-processor
* Built-in WiFi & Bluetooth
* 512KB on-chip SRAM memory
* 4-8MB external memory (depending on your board)

<hr>

For starters, the ESP32 is very powerful: it contains a dual-core CPU that can be clocked at 80, 160 or 240MHz. That's quite a lot of computing in a reasonably small chip. It also has a ULP or Ultra Low Power Co-processor, and this is a much slower processor can be used to perform small tasks while the big dual-core CPU is in a sleep-mode.

Besides killer processors, the ESP32 also has a ton of memory. It includes 512KB of on-chip SRAM memory, used for data and program instructions. Besides this, there is also support for external memory and depending on your board, that might be as much as 4 to 8MB.

This means that the ESP32 is suitable for some heavier tasks, like connecting with cameras, recognizing speech, streaming data from the internet and so on.

But the biggest reason why I think this chip is so good, is that it has **built-in WiFi and Bluetooth**. So no need for additional radio modules, like you would see on most Arduino boards. The ESP32 is just one chip, with everything in 1 package.

The rest of the I/O is pretty impressive. There is also a **12-bit ADC**, which can be used to measure external voltages, there are **10 touch sensors** for detecting capacitive touches, an LED power management chip, a hall effect sensor, built-in acceleration for encryption and, again depending on your board, up to **34 programmable GPIO pins**.

So basically, the ESP32 is a very versatile chip that can be used for many IoT projects. And, if you use all of this power wisely, you can even let it run on a battery for a very long time. But, other videos in this series will focus on that.

And finally, I want to mention that the ESP32 also supports the Arduino framework. If you know how to program an Arduino board, then you already know how to work with the ESP32.  And it also implies that all of the Arduino libraries that exist, work on the ESP32. A huge advantage!