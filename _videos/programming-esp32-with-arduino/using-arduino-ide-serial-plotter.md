---
layout: video
collection: videos
title: "Using Arduino Serial Plotter"
videoId: mtP86o1gjgM
order: 5
series: Programming ESP32 with Arduino
uploadDate: 2020-05-22
not_featureable: true
---

Now while you're writing code, you might want to print out certain things to a console. Like the raw value of a temperature sensor or from the ADC, or from the built-in touch sensor. This can be useful while getting started or while debugging your program.

In Arduino this is accomplished by using Serial and you can do two things with it. One, you can print variables to a console, and two, you can plot graphs in real-time. This can especially useful when working with sensors because you can visually see how the sensors behave.

The trick is to to print everything one one line (with each value separated by a comma):

```
19876,9876,18762
```

You can even name your variables (and they will appear in the Serial Plotter):

```
variable1:8734, variable2:2873, variable3:910183
```

Example code showing how to print multiple variables to the serial plotter (and have there names shown):
```cpp
int counter = 0;

void setup(){
  Serial.begin(9600); // or 115200
}


void loop(){
  Serial.print("Count1:");
  Serial.print(counter);
  Serial.print(",Count2:");
  Serial.print(counter - 10);
  Serial.println();
  delay(500);
  counter++;
}
```