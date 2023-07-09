---
title: "Using IR Receiver (HX1838) + Remote Control"
videoId: 6JDmT31zSJk
duration: 414
order: 19
uploadDate: 2020-10-25
---

Control your ESP32 projects with an infrared remote control. They're cheap & easy to use.

By using a remote, you can replace physical buttons, and enjoy controlling your projects from distance.

## Useful resources

* Arduino library IRremote: [https://github.com/z3t0/Arduino-IRremote](https://github.com/z3t0/Arduino-IRremote)

Wiring diagram:

![Wiring for HX1838 IR receiver]({{page.url}}../images/hx1838-pins-wiring.jpg)
*Wiring for HX1838 IR receiver*

Full code used in this video:

```cpp
#include <Arduino.h>
#include <IRremote.h>

#define RECEIVER_PIN 5
IRrecv receiver(RECEIVER_PIN);
decode_results results;

void setup(){
  Serial.begin(9600);
  receiver.enableIRIn();
}

void loop(){
  if (receiver.decode(&results)){
    Serial.println(results.value, HEX);

    // Up arrow pressed
    if(results.value == 0xFF906F){
        digitalWrite(LED_BUILTIN, LOW);
    }

    // Down arrow pressed
    if(results.value == 0xFFE01F){
        digitalWrite(LED_BUILTIN, HIGH);
    }

    receiver.resume();
  }
}
```
