---
title: "Touch Pins as Wakeup Source"
videoId: oGdKPxXJtL8
duration: 321
order: 16
date: 2020-05-22
section: "Deep sleep"
---

Deep sleep is great to save power, but you can't let the ESP32 sleep forever. At some point, an external interrupt is needed to wake it up. One way you can do that is with the touch sensors. 

An example could be that you have a battery-powered device with a display. To save power, you turn the display off and put the ESP32 into deep sleep. However, you want to wake up when someone touches your device, so you can turn on the display and show something useful.

Now to allow the touch sensor to wake the ESP32 up, we have to do three things: 
1. Configure a threshold value (once this value is crossed, the ESP32 will wakeup)
2. Enable the touch interrupt (so the ESP32 knows that it has to keep that powered on)
3. Actually go into deep sleep.

Translated into Arduino code, you'll get:

```cpp
#include <Arduino.h>
#define TOUCH_THRESHOLD 40

void callback(){
}

void setup(){
    Serial.begin(9600);
    Serial.println("ESP32 has started");
    
    // Setup interrupt on Touch Pad 0 (GPIO4)
    touchAttachInterrupt(T0, callback, TOUCH_THRESHOLD);
    
    //Configure Touchpad as wakeup source
    esp_sleep_enable_touchpad_wakeup();
    
    Serial.println("Going to deepsleep");
    delay(1000);
    esp_deep_sleep_start();
}

void loop(){
  //This will never be reached
}
```

Normally, when you enter deep sleep, the ESP32 powers down as many peripherals as it can to save power. Here we want to make an exception for the touch sensor, and that's what we do with `esp_sleep_enable_touchpad_wakeup()`. This tells the ESP32 to keep the touch sensor on when going to sleep.

Small side note: using the touch sensor as a wakeup source does not require the ULP. Instead, this is run on the RTC so you'll have very little power consumption when you enter deep sleep and have one of the touch pins configured as wakeup source. Great!