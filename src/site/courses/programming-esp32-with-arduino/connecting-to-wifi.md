---
title: "Connecting to WiFi"
videoId: 6zbEVAXVBjI
duration: 415
order: 12
uploadDate: 2020-05-22
---

The ESP32 is an amazing chip for building IoT devices because it has WiFi built-in.

Here's a simple Arduino program that connects to a WiFi network of your choosing. 
Just remember to correctly set the `WIFI_NETWORK` and `WIFI_PASSWORD` variables.

```cpp
#include <Arduino.h>
#include "WiFi.h"

#define WIFI_TIMEOUT_MS 20000
#define WIFI_NETWORK "My Network"
#define WIFI_PASSWORD "SuperSecure1"

void connectToWiFi(){
    Serial.print("Connecting to Wifi");
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_NETWORK, WIFI_PASSWORD);
    
    unsigned long startAttemptTime = millis();
    
    // Keep looping while we're not connected and haven't reached the timeout
    while (WiFi.status() != WL_CONNECTED && 
              millis() - startAttemptTime < WIFI_TIMEOUT_MS){
        Serial.print(".");
        delay(100);
    }
    
    // Make sure that we're actually connected, otherwise go to deep sleep
    if(WiFi.status() != WL_CONNECTED){
        Serial.println(" Failed!");
      // Handle this case. Restart ESP, go to deep sleep, retry after delay...
    }else{
        Serial.print(" Connected!");
        Serial.println(WiFi.localIP());
    }
}
```