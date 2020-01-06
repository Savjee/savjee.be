---
layout: post
title: "Multitasking on ESP32 with Arduino and FreeRTOS"
quote: 
thumbnail: /uploads/2020-01-06-multitasking-esp32-arduino-freertos/poster-750.jpg
upload_directory: /uploads/2020-01-06-multitasking-esp32-arduino-freertos
---

By now, it's no secret that the ESP32 is my go-to chip for making IoT devices. They're small, powerful, have a ton of onboard features, and they're relatively easy to program.

However, when using it together with Arduino, all your code runs on a single core. That seems a bit wasteful, so let's change that by using FreeRTOS to schedule tasks across both cores.

<!--more-->

## Why?
There are several use cases for wanting to multitask on a microcontroller. For instance: you might have a microcontroller that reads a temperature sensor, shows it on an LCD, and send it to the cloud.

You can do all three synchronously, one after the other. But what if you're using an e-ink display that takes a few seconds to refresh?

Luckily the Arduino implementation for the ESP32 includes the possibility to schedule tasks with FreeRTOS. These can run on a single core, many cores and you can even define which is more important and should get preferential treatment.


## Creating tasks
To schedule a task, you have to do two things: create a function that contains the code you want to run and then create a task that calls this function.

Let's say I want to blink an LED on and off continuously. 

First, I'll define the pin to which the LED is connected and set its mode to `OUTPUT`. Very standard Arduino stuff:

```cpp
const int led1 = 2; // Pin of the LED

void setup(){
  pinMode(led1, OUTPUT);
}
```

Next, I'll create a function that will become the basis of the task. I use `digitalWrite()` to turn the LED on and off and use `vTaskDelay` (instead of `delay()`) to pause the task 500ms between changing states:

```cpp
void toggleLED(void * parameter){
  for(;;){ // infinite loop

    // Turn the LED on
    digitalWrite(led1, HIGH);

    // Pause the task for 500ms
    vTaskDelay(500 / portTICK_PERIOD_MS);

    // Turn the LED off
    digitalWrite(led1, LOW);

    // Pause the task again for 500ms
    vTaskDelay(500 / portTICK_PERIOD_MS);
  }
}
```

That's your first task! Couple of things to note:

Yes, we did create an infinite `for(;;)` loop, and that might seem a bit strange. How can we multitask if we write a task that keeps going forever? The trick is `vTaskDelay`, which tells the scheduler that this task should not be executed for a given period. The scheduler will pause the for-loop and run other tasks (if there are any).
 
Last but not least, we have to tell the scheduler about our task. We can do this in the `setup()` function:

```cpp
void setup() {
  xTaskCreate(
    toggleLED,    // Function that should be called
    "Toggle LED",   // Name of the task (for debugging)
    1000,            // Stack size (bytes)
    NULL,            // Parameter to pass
    1,               // Task priority
    NULL             // Task handle
  );
}
```

That's it! Want to blink another LED at a different interval? Just create another task and sit back while the scheduler takes care of running both of them.

## Creating a one-off task
You can also create tasks that only run once. For example, [my energy monitor]({% post_url 2019-07-07-Home-Energy-Monitor-ESP32-CT-Sensor-Emonlib %}) creates a task to upload data to the cloud when it has enough readings.

One-off tasks don't need a never-ending for loop, instead it looks like this:

```cpp
void uploadToAWS(void * parameter){
    // Implement your custom logic here

    // When you're done, call vTaskDelete. Don't forget this!
    vTaskDelete(NULL);
}
```

This looks like a regular C++ function except for the `vTaskDelete()`. After calling it, FreeRTOS knows that the task is finished and should not be rescheduled. (Note: don't forget to call this function, or it will lead to the watchdog restarting the ESP32).

```cpp
xTaskCreate(
    uploadToAWS,    // Function that should be called
    "Upload to AWS",  // Name of the task (for debugging)
    1000,            // Stack size (bytes)
    NULL,            // Parameter to pass
    1,               // Task priority
    NULL             // Task handle
);
```

## Choose which core to run on
When you use `xTaskCreate()`, the scheduler is free to choose which core it runs your task on. In my opinion, this is the most flexible solution (you never know when a quad-core IoT chip might come along, right?)

However, it's possible to pin a task to a specific core with `xTaskCreatePinnedToCore`. It's just like `xTaskCreate` and takes one additional parameter, the core on which you want to run the task:

```cpp
xTaskCreatePinnedToCore(
    uploadToAWS,      // Function that should be called
    "Upload to AWS",    // Name of the task (for debugging)
    1000,               // Stack size (bytes)
    NULL,               // Parameter to pass
    1,                  // Task priority
    NULL,               // Task handle
    0,          // Core you want to run the task on (0 or 1)
);
```

## Check which core you're running on
Most ESP32 boards have dual-core processors, so how do you know which core your task is running on? 

Just call `xPortGetCoreID()` from within your task:

```cpp
void exampleTask(void * parameter){
  Serial.print("Task is running on: ");
  Serial.println(xPortGetCoreID());
  vTaskDelay(100 / portTICK_PERIOD_MS);
}
```

When you have enough tasks, the scheduler will start to dispatch them to both cores.

## Stopping tasks
Now what if you added a task to the scheduler, but you want to stop it? Two options: you delete the task from within itself or you use a task handle. Ending a task from within was already discussed before (use `vTaskDelete`).

To halt a task from somewhere else (like another task or your main loop), we have to store a task handle:

```cpp
// This TaskHandle will allow 
TaskHandle_t task1Handle = NULL;

void task1(void * parameter){
   // your task logic
}

xTaskCreate(
    task1,
    "Task 1",
    1000,
    NULL,
    1,
    task1Handle            // Task handle
);
```

All we had to do was define the handle and pass it as the last parameter of `xTaskCreate`. Now we can kill it with `vTaskDelete`:

```cpp
void anotherTask(void * parameter){
  // Kill task1 if it's running
  if(task1Handle != NULL) {
    vTaskDelete(task1Handle);
  }
}
```

## Task priority
When creating tasks, we have to give it a priority. It's the 5th parameter of `xTaskCreate`. Priorities are important when two or more tasks are competing for CPU time. When that happens, the scheduler will first run the higher-priority task. Makes sense!

In FreeRTOS, **a higher priority number means a task is more important**. I found this somewhat counter-intuitive because to me a "priority 1" sounds more important than a "priority 2", but that's just me.

When two tasks share the same priority, FreeRTOS will share the available processing time between them.

Each task can have a priority between 0 and 24. The upper limit is defined by `configMAX_PRIORITIES` in the [FreeRTOSConfig.h](https://github.com/espressif/arduino-esp32/blob/master/tools/sdk/include/freertos/freertos/FreeRTOSConfig.h#L174) file.

I use this to differentiate primary tasks with secondary ones. Take my home energy meter &mdash; the highest priority task is measuring electricity (priority 3). Updating the display or syncing time with an NTP server is not so critical to its core functionality (priority 2).

## You don't need tasks to multitask
Just a quick side note before ending this post: you don't need FreeRTOS or a multicore microcontroller to do multiple things at the same time. 

There are many tutorials online on how you can use `millis()` to accomplish the same thing in your `loop()` function. Another solution would be to use an Arduino task scheduler like [TaskScheduler](https://github.com/arkhipenko/TaskScheduler/blob/master/examples/Scheduler_example01/Scheduler_example01.ino). It runs on any Arduino-compatible board, including ones that don't have a multicore processor.

But these are beyond the scope of this article. I'll stick to the ESP32 for now!

**Happy multitasking!**
