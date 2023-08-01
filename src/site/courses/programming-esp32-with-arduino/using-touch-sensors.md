---
title: "Using Touch Pins"
videoId: 4YY7TutRrQE
duration: 231
order: 9
date: 2020-05-22
section: "Hardware"
---

The ESP32 has 10 capacitive touch sensors on board that can be used to detect if a person touches a wire or for example a piece of metal on the enclosure of your device.

To demonstrate how it works, here's a simple program that turns on the built-in LED as soon as you touch a wire:

```cpp
#define LED_BUILTIN 22

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  // For my board LOW = turn ON, HIGH = turn off
  if(touchRead(4) < 50){
    digitalWrite(LED_BUILTIN, LOW);
  }else{
    digitalWrite(LED_BUILTIN, HIGH);
  }

  delay(100);
}
```

In a nutshell, the function `touchRead` is used to grab the capacitance of the touch sensor.