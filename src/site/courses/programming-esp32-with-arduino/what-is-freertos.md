---
title: "What is FreeRTOS?"
videoId: kP-pP6FEu8I
duration: 156
order: 23
uploadDate: 2021-02-09
---

Want to multitask on your ESP32? By using FreeRTOS you won't have to worry about scheduling your tasks and making sure that all of them are given enough processing time.

FreeRTOS is a real-time operating system, designed to run on microcontrollers. It has a scheduler that gives each task a fair share of CPU processing power. When that's not possible, the scheduler will use a task's priority to give the most important ones the most CPU time.

FreeRTOS has many implementations and is not limited to the ESP32. The concepts explained in this video (and future videos) should work on other types of microcontrollers as well. Minor changes might be required for certain functions.

## Useful resources

* FreeRTOS homepage: [https://www.freertos.org](https://www.freertos.org)
* Documentation for the FreeRTOS implementation for ESP32: [https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/system/freertos.html](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/system/freertos.html)

