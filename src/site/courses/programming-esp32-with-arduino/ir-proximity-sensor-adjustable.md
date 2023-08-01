---
title: "IR Proximity Sensor (adjustable)"
videoId: vzPV3hax03Y
duration: 177
order: 22
date: 2021-05-20
section: "Hardware"
---

This water-proof sensor can detect if there's an object within its range using infrared light. The range is configurable up to 2 meters and the sensor is waterproof.

Ideal use cases: checking if your car is in the garage, cheaking if there are letters in your mailbox, ...

[Buy this sensor from DFRobot](https://www.dfrobot.com/product-1653.html?tracking=6099f25f89161) (They kindly provided me with this sensor).

## Full code

```cpp
#include <Arduino.h>

#define SENSOR_PIN 5

void setup() {
  Serial.begin(9600);
  pinMode(SENSOR_PIN, INPUT);
}

void loop() {
  Serial.print("Sensor value: ");
  Serial.println(digitalRead(SENSOR_PIN));

  delay(500);
}
```
