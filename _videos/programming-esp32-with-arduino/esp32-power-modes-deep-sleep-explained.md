---
layout: video
collection: videos
title: "Deep Sleep & Other Power Modes"
videoId: dyvpRYfWjkY
order: 14
series: Programming ESP32 with Arduino
uploadDate: 2020-05-22
not_featureable: true
---

The ESP32 is a very powerful microcontroller, with a fast processor, a lot of memory and with built-in WiFi and Bluetooth. Surely that must mean that it's not suitable for battery operation? Well actually, no. The ESP32 can run on batteries for a long time if you carefully manage how long you use the CPU and WiFi. 

In a nutshell: you want to keep the processor in a sleep mode for as long as possible. And when you actually need to power on the CPU, do it as shortly as possible. The same thing goes for WiFi: turn it on only when you have to and for as little long as possible.

Additionally, the ESP32 supports various power modes. Let's go over them now, and to make it easy to understand, I've visualized the components inside the ESP32 so you can see what happens at different power modes.

![Overview of ESP32 power modes]({{page.url}}../images/esp32-power-modes.png)
*Overview of ESP32 power modes (source: [ESP32 datasheet](https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf))*

## Active mode
The heaviest power mode is called "Active". In this mode, the processor is turned on as well as the WiFi and Bluetooth radio. This comes with a power consumption of up to 260mA, which could deplete a 2000mAh battery in just under 8 hours.

## Modem-sleep
However, you don't need WiFi and Bluetooth to be on all the time. If you turn them off, the chip switches to modem-sleep. This reduces the power consumption to 20mA and you can still use the full power of the processor. And, if you reduce the clock speed of the processor you can get that down to as low as 3mA. Not bad, but still nowhere near good enough.

## Light sleep
Next up: light-sleep. In this state, the main processor is paused and is waiting for event to wake it up. This can be a timer or an external interrupt like the press of a button. In this state, the contents of the memory will be retained when the CPU wakes up. Power consumption of light sleep is around 0.8mA.

## Deep-sleep
To reduce that even further, you can go into deep sleep, a mode in which the processor and most of the peripherals are turned off to conserve power. The chip can still wake from external interrupts because the ULP, the ultra-low-power co-processor is still turned on. Power consumption at this stage is 0.15mA.

Further reduction of power consumption can be achieved by turning the ULP off, and only keeping the RTC timer and memory on. This results in power consumption of just 10uA. 

## Hibernation & power off
The final power mode is hibernation, which turns off everything except the RTC timer.. That way the chip can still wake up after a certain amount of time. No memory is kept powered on, so you can't preserve data during hibernation. Power consumption here is just 5uA.