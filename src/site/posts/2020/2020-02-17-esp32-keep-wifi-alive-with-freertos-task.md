---
layout: post
title: "ESP32: Keep WiFi connection alive with a FreeRTOS task"
quote: 
tags: [ESP32, FreeRTOS]
---

I have a few ESP32's running in my house. A few of them are running 24/7 and require an always-on WiFi connection. That's been quite tricky to implement. I used to include various checks throughout my code, but that's not scalable. 

What I need is something running in the background that is continuously monitoring my WiFi connection, regardless of what other code is running. Luckily we can use FreeRTOS on the ESP32 to do just that!

<!--more-->

{% render "youtube-embed.html", videoId: "YSGPcm-qxDA" %}

I created a FreeRTOS task that checks the WiFi connection every 10 seconds. WiFi up? Good, do nothing, and check again in 10 seconds. WiFi down? Connect it again!

![](/uploads/2020-02-17-esp32-keep-wifi-alive-with-freertos-task/freertos-wifi-alive-esp32-flowchart.png)
*Flowchart of the FreeRTOS task*

In code:

```cpp
// Include the necessary libraries
#include <Arduino.h>
#include "WiFi.h"

#define WIFI_NETWORK "--- your WiFi network name ---"
#define WIFI_PASSWORD "--- your WiFi password ---"
#define WIFI_TIMEOUT_MS 20000 // 20 second WiFi connection timeout
#define WIFI_RECOVER_TIME_MS 30000 // Wait 30 seconds after a failed connection attempt

/**
 * Task: monitor the WiFi connection and keep it alive!
 * 
 * When a WiFi connection is established, this task will check it every 10 seconds 
 * to make sure it's still alive.
 * 
 * If not, a reconnect is attempted. If this fails to finish within the timeout,
 * the ESP32 will wait for it to recover and try again.
 */
void keepWiFiAlive(void * parameter){
    for(;;){
        if(WiFi.status() == WL_CONNECTED){
            vTaskDelay(10000 / portTICK_PERIOD_MS);
            continue;
        }

        Serial.println("[WIFI] Connecting");
        WiFi.mode(WIFI_STA);
        WiFi.begin(WIFI_NETWORK, WIFI_PASSWORD);

        unsigned long startAttemptTime = millis();

        // Keep looping while we're not connected and haven't reached the timeout
        while (WiFi.status() != WL_CONNECTED && 
                millis() - startAttemptTime < WIFI_TIMEOUT_MS){}

        // When we couldn't make a WiFi connection (or the timeout expired)
		  // sleep for a while and then retry.
        if(WiFi.status() != WL_CONNECTED){
            Serial.println("[WIFI] FAILED");
            vTaskDelay(WIFI_RECOVER_TIME_MS / portTICK_PERIOD_MS);
			  continue;
        }

        Serial.println("[WIFI] Connected: " + WiFi.localIP());
    }
}
```

Here is how I run the task (it's pinned to the core used by the Arduino framework):

```cpp
xTaskCreatePinnedToCore(
	keepWiFiAlive,
	"keepWiFiAlive",  // Task name
	5000,             // Stack size (bytes)
	NULL,             // Parameter
	1,                // Task priority
	NULL,             // Task handle
	ARDUINO_RUNNING_CORE
);
```

Feel free to use this in your own code. Just don't forget to change the configuration variables:

* `WIFI_NETWORK` and `WIFI_PASSWORD` is where you store your WiFi credentials.
* `WIFI_TIMEOUT_MS` is a timeout for the WiFi connection (in milliseconds). If no connection could be established within this timeout, we stop and wait a bit. No need to keep trying.
* `WIFI_RECOVER_TIME_MS` defines how long we should wait between a failed connection attempt and a retry (also in milliseconds).

## How it works
The task is an endless `for` loop that checks if we are connected to WiFi. If that's the case, the task doesn't have to do anything. It pauses itself for 10 seconds and then restarts the `for` loop by calling `continue`.

```cpp
if(WiFi.status() == WL_CONNECTED){
	vTaskDelay(10000 / portTICK_PERIOD_MS);
	continue;
}
```

This is the best-case scenario. The FreeRTOS scheduler will run the task every 10 seconds and check if the WiFi is still up.

If there is no WiFi connection, we try to connect. This can happen when your WiFi network went offline for a while or when the ESP32 just booted.

```cpp
Serial.println("[WIFI] Connecting");
WiFi.mode(WIFI_STA);
WiFi.begin(WIFI_NETWORK, WIFI_PASSWORD);
```

Now, I don't want the ESP32 to try to connect to WiFi endlessly, so I added a timeout condition. It will attempt to connect to WiFi until either a connection was established or the timeout was reached:

```cpp
unsigned long startAttemptTime = millis();

// Keep looping while we're not connected and haven't reached the timeout
while (WiFi.status() != WL_CONNECTED && 
        millis() - startAttemptTime < WIFI_TIMEOUT_MS){}
```

The last thing to do is check if we now have a WiFi connection. If not, the timeout was probably reached, and we should rerun the task after a short waiting period (which I call `WIFI_RECOVER_TIME_MS`).

```cpp
if(WiFi.status() != WL_CONNECTED){
	Serial.println("[WIFI] FAILED");
	vTaskDelay(WIFI_RECOVER_TIME_MS / portTICK_PERIOD_MS);
	continue;
}
```

And that's how the task works. Simple and yet very effective.

## Personal experience
I've been running this FreeRTOS task on my home energy monitor for a couple of months now. So far, it's been rock solid! When the WiFi goes out, the ESP32 just keeps trying to reconnect until it is successful.

And because it's a FreeRTOS task that keeps running, I don't have to worry about checking my WiFi connectivity at other places in my code. 

In FreeRTOS we trust.

## Feedback
What do you think about this solution? Let me know in the comments below!