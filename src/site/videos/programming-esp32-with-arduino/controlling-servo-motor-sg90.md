---
layout: video
collection: videos
title: "Using Servo Motors (SG90)"
videoId: dJAlkrXbfbQ
order: 18
series: Programming ESP32 with Arduino
uploadDate: 2020-10-25
not_featureable: true
---

Servo motors give you precise control over their movements. Ideal for moving arms or joints in your DIY project. In this video, I'll explain how to use the SG90 (a great cheap servo motor) with the ESP32. No additional hardware required!

## Useful resources

* Datasheet SG90 Servo motor: [http://www.ee.ic.ac.uk/pcheung/teaching/DE1_EE/stores/sg90_datasheet.pdf](http://www.ee.ic.ac.uk/pcheung/teaching/DE1_EE/stores/sg90_datasheet.pdf)
* Servo library for the ESP32: [https://github.com/madhephaestus/ESP32Servo?utm_source=platformio&utm_medium=piohome](https://github.com/madhephaestus/ESP32Servo?utm_source=platformio&utm_medium=piohome)

Wiring diagram:

![How to connect the SG90]({{page.url}}../images/sg90-wiring.jpg)
*How to connect the SG90*

Full code used in this video:

```cpp
#include <Arduino.h>
#include <ESP32Servo.h> 

#define PIN_SERVO 13
Servo myServo;

void setup(){
  myServo.attach(PIN_SERVO);
}

void loop(){
  for (int pos = 0; pos <= 180; pos += 20) {
    myServo.write(pos);
    delay(500);
  }

  myServo.write(0);
  delay(1000);
}
```
