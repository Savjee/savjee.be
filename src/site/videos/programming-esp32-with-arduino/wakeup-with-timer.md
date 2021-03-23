---
layout: video
collection: videos
title: "Wakeup From Sleep With a Timer"
videoId: vln1NXpd77s
order: 15
series: Programming ESP32 with Arduino
uploadDate: 2020-05-22
not_featureable: true
---

Deep sleep is great to save power, but you can't let the ESP32 sleep forever. At some point you will want to wake the ESP32 up from sleep to do something useful. The easiest way to do that is with a timer. You can put the ESP32 to sleep and ask the RTC - the Real Time Clock - to wake it up after a certain amount of time has passed.

Here's a simple function that will put your ESP32 into deep sleep for a given amount of minutes:

```cpp
#define DEEP_SLEEP_TIME 15 // minutes

void goToDeepSleep()
{
    Serial.println("Going to sleep...");
    
    // Configure the timer to wake us up! Time in uS
    esp_sleep_enable_timer_wakeup(DEEP_SLEEP_TIME * 60 * 1000000);
    
    // Go to sleep! Zzzz
    esp_deep_sleep_start();
}
```

Deep sleep is great for battery-powered devices that occasionally need to use the WiFi radio.

Three things to mention about deep sleep. 

1. First, `esp_deep_sleep_start` shuts down the processor, so any code you write beneath this line won't be executed. 
2. Secondly, when the ESP32 awakes from the deep sleep, it will rerun your `setup` function.
3. And finally, when you enter deep sleep, all data stored in memory is lost.  If you want to keep some data around then watch the [next video in which I'll talk about RTC memory]({% link collections.videos, "programming-esp32-with-arduino/using-rtc-memory.md" %}).

