---
title: "VL53l0x: Time-of-Flight Distance Sensor"
videoId: SWBI6_rxmT8
duration: 234
order: 21
date: 2021-05-20
section: "Hardware"
courseName: "Programming ESP32 with Arduino"
---

Measure distance to an object by using a laser-based Time-of-Flight sensor. These sensors have a range of up to 2 meters and are pretty accurate.

You could use these for all sorts of things like measuring waterlevel in a container (without getting the sensor wet).

The sensor works by shining a laser onto an object, and timing how long it takes the light to be reflected back to the sensor.

## Useful resources

Arduino library used in this video:

* [VL53l0x-Arduino](https://github.com/pololu/vl53l0x-arduino)


## Full code

```cpp
#include <Arduino.h>
#include <Wire.h>
#include <VL53L0X.h>

VL53L0X tofSensor;

void setup() {
  Serial.begin(9600);
  Wire.begin(19, 22);

  if(tofSensor.init() != true){
    Serial.println("Could not initialize ToF sensor.");
    // Handle error
  }
}

void loop() {
  Serial.print(tofSensor.readRangeSingleMillimeters());
  Serial.println(" mm");

  delay(500);
}
```
