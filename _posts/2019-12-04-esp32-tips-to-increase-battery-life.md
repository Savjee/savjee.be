---
layout: post
title: "ESP32: Tips to increase battery life"
quote: 
thumbnail: /uploads/2019-12-04-esp32-tips-to-increase-battery-life/poster-750.jpg
upload_directory: /uploads/2019-12-04-esp32-tips-to-increase-battery-life
---

Running an ESP32 on a battery is a tricky operation. The chip is a powerhouse, and with power comes great responsibility. In this post, I’ll outline how I got an ESP32 to run for over 15 weeks (and counting) on a single 1000mAh battery.

<!--more-->

Before we begin: the code samples shown in this post are for use with the [Arduino framework](https://github.com/espressif/arduino-esp32). This was not tested with `esp-idf` directly.

## Tip 1: Power the ESP32 directly from a battery
Want to increase battery life? Then connect your battery directly to your ESP32. The USB port is very inefficient to power the microcontroller because it has a voltage regulator that converts the 5V input to the 3.3V that the ESP needs. This wastes a lot of precious energy!

Instead, buy an ESP32 that has a built-in battery connector, like the [LOLIN32 Lite](https://wiki.wemos.cc/products:lolin32:lolin32_lite), one of my personal favourites. (Although they are discontinued, you can still find alternatives online.)

![WEMOS LOLIN32 Lite](/uploads/2019-12-04-esp32-tips-to-increase-battery-life/lolin32-lite.jpg)
*WEMOS LOLIN32 Lite. Discontinued but many variant available. Still my favorite!*

The battery connector allows you to bypass the USB voltage regulator and directly power your ESP with a battery. Just make sure to pick a battery with the same connector and one that outputs something between 3 and 3.7V. Most LIPO batteries will work just fine.

*Don’t believe me? Try powering an ESP with a USB power bank. You’ll get a few days of battery life at most. The rest of the energy is wasted on the conversion from 5V to 3.3V.*

## Tip 2: Pick the right ESP32 board (single-core)
Most IoT devices are relatively simple and don’t require a lot of computing power. Yet the ESP32 has a dual-core processor.

Consider buying a board that uses the single-core version of the ESP32 ([ESP32-SOLO-1](https://www.espressif.com/sites/default/files/documentation/esp32-solo-1_datasheet_en.pdf)).

The difference between dual-core and single-core? Well, a regular ESP32 will consume between 27-44mA when running at 160MHz while the single-core consumes about 30% less, coming in at 27mA-34mA.

![ESP32 power consumption](/uploads/2019-12-04-esp32-tips-to-increase-battery-life/esp32-cpu-power-consumption.png)
*Power consumption of the ESP32 according to Espressif*


## Tip 3: Reduce the clock speed
Fewer cores consume less power. The same thing can be said for slower cores. If you can get away with a single-core ESP32, chances are you can get away with running that core at lower clock speeds.

Reducing the default clock speed from 160MHz to 80MHz can drop the energy consumption another 20%!

In Arduino it’s just a one-liner:

```cpp
setCpuFrequencyMhz(80);
```

## Tip 4: Turn off everything in deep sleep
When running an ESP32 on a battery, you’ll want to keep it in deep sleep for as long as possible. In case you don’t know how: you configure a wakeup timer and then start the deep sleep mode:

```cpp
// How many minutes the ESP should sleep
#define DEEP_SLEEP_TIME 15

// Configure the timer to wake us up!
esp_sleep_enable_timer_wakeup(DEEP_SLEEP_TIME * 60L * 1000000L);

// Go to sleep! Zzzz
esp_deep_sleep_start();
```

However, I found that this is not sufficient to keep energy consumption to a minimum. I’ve seen various bug reports claiming that this doesn’t always turn off the WiFi or Bluetooth radio before going to deep sleep.

So instead of calling `esp_deep_sleep_start()` directly, I do some preparations first. I disconnect the WiFi, turn off the WiFi and Bluetooth radio, turn off the ADC and then turn off the WiFi and Bluetooth radios again, but with the ESP API:

```cpp
#include "WiFi.h" 
#include "driver/adc.h"
#include <esp_wifi.h>
#include <esp_bt.h>

// How many minutes the ESP should sleep
#define DEEP_SLEEP_TIME 15

void goToDeepSleep()
{
  Serial.println("Going to sleep...");
  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
  btStop();

  adc_power_off();
  esp_wifi_stop();
  esp_bt_controller_disable();

  // Configure the timer to wake us up!
  esp_sleep_enable_timer_wakeup(DEEP_SLEEP_TIME * 60L * 1000000L);

  // Go to sleep! Zzzz
  esp_deep_sleep_start();
}
```

Note: If you’re using the built-in ADC, don’t forget to turn it back on before using it:

```cpp
adc_power_on();
```

WiFi or Bluetooth doesn’t have to be explicitly turned on. The regular `WiFi.begin(NETWORK, PASSWORD);` is enough.

Another tip: don’t forget to put your peripherals into sleep mode when you’re not using them. Many sensors have built-in power-saving features that you can trigger. So definitely check out the libraries you use to interface with them and check if they have this.

## Tip 5: Add a WiFi connection timeout
The ESP32 is so great for IoT projects because it has built-in WiFi. No need for proprietary wireless signals and protocols. The only downside is that WiFi is pretty power-hungry, so you want to minimize the time spent with the radio on.

I always add a timeout for setting up a WiFi connection. You don’t want your ESP32 to keep looking for a particular WiFi network endlessly. It’ll drain the battery if your network is down for just a couple of minutes (modem restart, power outage, …) or of its temporarily out of range.

I usually implement a 10-second timeout. If no WiFi connection can be established in this time frame, the ESP32 goes back to deep sleep (hoping WiFi is available when it wakes back up):

```cpp
#define WIFI_NETWORK “YOUR_WIFI_NETWORK_NAME”
#define WIFI_PASSWORD “YOUR_WIFI_PASSWORD”
#define WIFI_TIMEOUT 10000 // 10seconds in milliseconds

void connectToWiFi()
{
  Serial.print("Connecting to WiFi... ");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_NETWORK, WIFI_PASSWORD);

	// Keep track of when we started our attempt to get a WiFi connection
  unsigned long startAttemptTime = millis();

  // Keep looping while we're not connected AND haven't reached the timeout
  while (WiFi.status() != WL_CONNECTED && 
          millis() - startAttemptTime < WIFI_TIMEOUT){}

  // Make sure that we're actually connected, otherwise go to deep sleep
  if(WiFi.status() != WL_CONNECTED){
    Serial.println("FAILED");
    goToDeepSleep();
  }

  Serial.println("OK");
}
```

## Tip 6: Use RTC memory to reduce WiFi connections
Finally, the biggest tip of them all: WiFi connections are super rough on battery life, so making fewer will improve battery life dramatically.

Let’s say you want to build a temperature sensor that takes a new measurement every 15 minutes. Do you really need to know the temperature in real-time? Or is it okay to send a batch of readings every 6 hours, for instance?

If so, consider using the RTC memory of the ESP to store your measurements without connecting to WiFi. Many of my sensors employ the following algorithm:

* Wake up from deep sleep
* Measure something
* Store the measurement in the RTC memory
* If we have X readings, connect to WiFi and send them all to the cloud
* If not, go back to deep sleep

Translated into Arduino code, that would give you:

```cpp
// How many readings we want to store before sending them over WiFi
// -> 20 readings with 15min between each reading = only connecting to WiFi every 300 minutes (5hours) instead of every 15min
#define MAX_OFFLINE_READINGS 20

// Place in the RTC memory to store the offline readings (and how many we have so far)
RTC_DATA_ATTR unsigned char offlineReadingCount = 0;
RTC_DATA_ATTR unsigned int readings_temp[MAX_OFFLINE_READINGS + 1];

// Write the temperature (20.9°C) to the RTC memory. You might want to replace this with your actual measurement code ;)
readings_temp[offlineReadingCount] = 209;
offlineReadingCount++;

// If we collected less then the maximum amount of readings, go back to deep sleep!
if(offlineReadingCount <= MAX_OFFLINE_READINGS){
    goToDeepSleep();
    return;
}

// If we get here we have to send the readings over WiFi
sendReadings();
```

## Future tip
Another tip I’m currently exploring is using a hardware encryption module to speed up encryption. For me, that would come in handy because I use AWS IoT, which requires strong encryption, and that takes a while to do on a vanilla ESP32.

Espressif has also realized this and has announced the ESP32-S2, a single-core version with built-in hardware-accelerated encryption.

I haven’t got my hands on one of these yet, so that’s for another time.

## Conclusion
The tips above have yielded me good battery life on several of my ESP32 projects. My main goals are always: reduce the number of WiFi connections and maximize the time you spend in deep sleep.

Let me know in the comments below if you have additional tips and tricks.