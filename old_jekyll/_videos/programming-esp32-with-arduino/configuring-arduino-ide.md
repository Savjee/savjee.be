---
layout: video
collection: videos
title: "Configuring Arduino IDE"
videoId: wNtGHCrO7E4
order: 3
series: Programming ESP32 with Arduino
uploadDate: 2020-05-22
not_featureable: true
---

By default, the Arduino IDE only supports official Arduino boards. You can easily add support for the ESP32 by using the Boards Manager.

* Go to the Preferences and look for the field "Additional Board Manager URLs".
* Paste this link in there: 

```
https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
```

![]({{page.url}}../images/arduino-ide-add-board-url.png)
*Tip: If you want multiple custom boards: separate the URLs with commas*

Next step it to actually install the required software. 

* Head over to `Tools > Board > Board Manager...`.
* Search for "esp32"
* Select the board and click on "Install".

![]({{page.url}}../images/arduino-ide-install-esp32-board.png)


That's all! The Arduino IDE will take care of downloading the necessary toolchains & setting them up for your machine.

## Additional links:
* Arduino IDE download: [https://www.arduino.cc/en/main/software](https://www.arduino.cc/en/main/software)
* Source code of the Arduino Core for ESP32: [https://github.com/espressif/arduino-esp32](https://github.com/espressif/arduino-esp32 )
