---
title: "Correctly Measure Battery Level - MAX17048"
videoId: mhmD-QA6kf0
duration: 262
order: 20
uploadDate: 2021-05-20
---

Battery-powered IoT projects require you to monitor your battery's percentage. Measuring battery voltage is not ideal, because the voltage doesn't drop linearly.

Fuel gauges are a better alternative. They work straight away, don't consume power while in standby, and they're accurate without any calibration!

[Buy a Battery Fuel Gauge from DFRobot](https://www.dfrobot.com/product-1734.html?tracking=6099f25f89161) (They kindly provided me with this sensor)

## Useful resources

Libraries you can use to interface with this sensor:

* [DFRobot_MAX17043](https://github.com/DFRobot/DFRobot_MAX17043)
* [MAX1704x](https://github.com/porrey/max1704x)


Also check out [my blog post about how to use this sensor for a more in-depth explanation]({% link collections.posts, "2021-04-28-max17043-battery-monitoring-done-right-arduino-esp32.md" %}).


## Full code

```cpp
#include "MAX17043.h"

void setup(){
    Serial.begin(115200);
    FuelGauge.begin();
}

void loop() {
    float percentage = FuelGauge.percent();
    float voltage = FuelGauge.voltage();

    Serial.print("Battery percentage: ");
    Serial.print(percentage);
    Serial.println("%");

    Serial.print("Battery voltage: ");
    Serial.print(voltage);
    Serial.println("V");

    delay(1000);
}
```
