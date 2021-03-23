---
layout: video
collection: videos
title: "Installing USB drivers"
videoId: JmDxP4O4Trk
order: 2
series: Programming ESP32 with Arduino
uploadDate: 2020-05-22
not_featureable: true
---

ESP32 development boards have a built-in USB to UART controller, so you don't need a standalone USB to TTL controller to flash a program to the ESP32.

You do however need a driver so that your computer can recognise and talk to this chip. This depends on your board, but most likely you need a driver for either the CH340 or CP210x chip. 

You can find out what chip your board has by looking at its datasheet or by looking closely at the board. You should be able to find a chip that has one of these numbers printed on.

Download links:
* CH340
  * Mac: [https://github.com/adrianmihalko/ch340g-ch34g-ch34x-mac-os-x-driver](https://github.com/adrianmihalko/ch340g-ch34g-ch34x-mac-os-x-driver)
  * Linux & Windows: [https://learn.sparkfun.com/tutorials/how-to-install-ch340-drivers/all](https://learn.sparkfun.com/tutorials/how-to-install-ch340-drivers/all)

* CP210x:
  * All platforms: [https://www.silabs.com/products/development-tools/software/usb-to-uart-bridge-vcp-drivers](https://www.silabs.com/products/development-tools/software/usb-to-uart-bridge-vcp-drivers)