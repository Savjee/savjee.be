---
title: "Connect and Send Data to ThingSpeak"
videoId: F1fQ8m3S8-4
duration: 544
order: 13
uploadDate: 2020-05-22
---

Once you have your ESP32 connected to WiFi, you can send data to external services to keep track of them. One of those is ThingSpeak.

In a nutshell, ThingSpeak allows you to send data to their cloud. They'll store it and they visualize it for you in a handy dashboard. It's free if you send less than 3 million messages per year, that's about 8,200 messages per day. That should be sufficient for DIY projects.

## Creating a channel
To get started you will need to sign up for a free Thingspeak account. 

Thingspeak is organized in a simple way: you can create channels that contains datafields. A simple example: if you're building a temperature sensor, you probably want to create 1 channel for your device with two fields: a temperature field and a humidity field.

To create a channel, go to Channels, My Channels and click on "New Channel".

![Create new ThingSpeak channel]({{page.url}}../images/thingspeak-create-channel.png)

I'll call mine `test-channel` and I'll define two fields: one for a simple counter and let's also send the current WiFi signal strength. Just so we have some data to visualize.

![Configuring fields in a ThingSpeak channel]({{page.url}}../images/thingspeak-channel-fields.png)
*Configuring fields in a ThingSpeak channel*

You can fill out some other details as well, but that's not required, so let's hit "Save channel". 

Thingspeak now shows you the dashboard of you channel, with a graph for each of the fields that we just defined, which is `counter` and `wifi_signal`.

## Installing ThingSpeak library
Now we're ready to push data to Thingspeak and you can do this in two ways: by making HTTP calls or by using their MQTT broker.

The easiest one is by using HTTP calls, but, you don't need to make these yourself. We can use the Thingspeak Arduino library. I'll install it by adding it to my `platformio.ini` file, under the section `lib_deps`. As mentioned before, PlatformIO will take care of downloading and installing this library.

```
lib_deps = 
	ThingSpeak
```

## Sending a field to ThingSpeak
Now let's write some code! In the `main.cpp` file, I already added code to connect to a WiFi network. I made [a video about this]({% link collections.all, "programming-esp32-with-arduino/connecting-to-wifi.md" %}) as well. Now there are two things I want to push to Thingspeak: a simple counter, just to demonstrate and the current WiFi signal strength.

Here is an example program that will push a simple counter to ThingSpeak. Make sure to change the `CHANNEL_ID` and `CHANNEL_API_KEY`. Also make sure to copy the `connectToWiFi()` function from [the previous]({% link collections.all, "programming-esp32-with-arduino/connecting-to-wifi.md" %}) video.

```cpp
#include "ThingSpeak.h"

#define CHANNEL_ID 99999999
#define CHANNEL_API_KEY "XXXXXXXXXXXXX"

WiFiClient client;

int counter = 0;

void setup() {
  Serial.begin(9600);
  connectToWiFi(); // this function comes from a previous video
  
  ThingSpeak.begin(client);
}

void loop() {
  counter++;

  ThingSpeak.writeField(CHANNEL_ID, 1, counter, CHANNEL_API_KEY);

  delay(15000); // 15 seconds
}
```

## Writing multiple fields
To update multiple fields in 1 go, we have to adapt the code a bit. The example above will make 1 request per field, which isn't efficient if you have multiple fields.

Instead of using the `writeField` method, you can use `setField` to configure all your fields and send them all in 1-go with `writeFields`:

```cpp
void loop() {
  counter++;

  ThingSpeak.setField(1, counter);
  ThingSpeak.setField(2, WiFi.RSSI());
  ThingSpeak.writeFields(CHANNEL_ID, CHANNEL_API_KEY);

  delay(15000); // 15 seconds
}
```