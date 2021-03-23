---
layout: video
collection: videos
title: "Controlling a Relay Board"
videoId: zIHPogas1cU
order: 11
series: Programming ESP32 with Arduino
uploadDate: 2020-05-22
not_featureable: true
---

An ESP32 can only control low power peripherals (3V). To control higher powered devices, like a light or outlet, you'll need a relay board.

> Disclaimer: please be careful when using a relay to switch mains voltage. Make sure that you know what you're doing, otherwise you could injure yourself.

To connect a relay, you need to have at least three wires: 3V (or 5V) and GND to power the relay board and an input pin for each relay you have.

![How to connect a relay board]({{page.url}}../images/connect-relay-board.jpg)
*How to connect a relay board*

This particular board has 2 relays, so it's got 2 input pins. Controlling the relays is relatively simple: putting power on Input pin 1 will turn the relay on. Cutting the power on that pin will turn it back off.

Here's a complete example of a program that toggles the relay every second:

```cpp
#include <Arduino.h>

#define RELAY_PIN 4

void setup() {
  pinMode(RELAY_PIN, OUTPUT);
}

void loop() {
  digitalWrite(RELAY_PIN, HIGH);
  delay(1000);
  digitalWrite(RELAY_PIN, LOW);
  delay(1000);
}
```