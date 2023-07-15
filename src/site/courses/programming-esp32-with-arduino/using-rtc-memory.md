---
title: "Using RTC Memory to Store Data During Sleep"
videoId: ij-hjzv6QKY
duration: 184
order: 17
date: 2020-05-22
tags: ["ESP32"]
section: "Deep sleep"
---

Using deep sleep is important for when you want to battery power your ESP32. One downside, however, is that during deep sleep, the main memory is powered down, so you lose everything that is stored in memory. That can be problematic if you want to keep track of some state while sleeping.

Luckily, there is a tiny bit of memory that you can keep powered on during deep sleep, and that's called the RTC memory. How tiny is it? Well you can only store 8KB of data in it, so depending on your use case you might have to be creative to fit in your data.

Now, to demonstrate how to use it, here's a simple program that increments a counter every time we touch one of the touchpins and afterwards goes straight into deep sleep:

```cpp
#include <Arduino.h>

RTC_DATA_ATTR unsigned int counter = 0;

#define TOUCH_THRESHOLD 50

void callback(){}

void setup()
{
    Serial.begin(9600);
    delay(500);
    
    Serial.print("Counter: ");
    Serial.println(counter++);
    
    // Setup interrupt on Touch Pad 0 (GPIO4)
    touchAttachInterrupt(T0, callback, TOUCH_THRESHOLD);
    
    //Configure Touchpad as wakeup source
    esp_sleep_enable_touchpad_wakeup();
    
    Serial.println("Going to deep sleep");
    delay(1000);
    esp_deep_sleep_start();
}

void loop()
{
	//This will never run
}
```

In a nutshell, you need to place `RTC_DATA_ATTR` in front of any variable that you want to store in RTC memory. That's it! The counter variable continues to work like any other variable, the only difference being the location where it's stored.