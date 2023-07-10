---
title: "Blinking LED"
videoId: tkDJQkB9eEY
duration: 328
order: 4
uploadDate: 2020-05-22
section: "Arduino IDE"
---

When learning a new programming language, the first thing that people teach you is the Hello World. In case of Arduino and ESP32's it's blinking an LED light.

Most ESP32 development boards have a built-in LED. So you don't need to hook up an external one. The built-in LED can be used to indicate status for example. Like blink twice while it's connecting to WiFi or something.

Full code:

```cpp
// Only if the pins of your board are different
#define LED_BUILTIN 22

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(500);
  digitalWrite(LED_BUILTIN, LOW);
  delay(500);
}
```