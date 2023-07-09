---
title: "How to Multitask with FreeRTOS?"
videoId: WQGAs9MwXno
duration: 384
order: 24
uploadDate: 2021-02-09
---

Run multiple tasks on the ESP32 with FreeRTOS. For instance: blinking two LED's at different intervals or increment two counters at the same time.

A FreeRTOS task is nothing more than a standard C (or C++) function. Nothing fancy, very easy!

Most ESP32's have a dual-core processor, so FreeRTOS will balance your tasks across cores. This technique also works for single-core versions of the ESP32. In that case, FreeRTOS will rapidly switch between tasks, giving the impression that it's multitasking.

## Full code

{% highlight cpp %}
int count1 = 0;
int count2 = 0;

void task1(void * parameters){
    for(;;){ // infinite loop
        Serial.print("Task 1 counter: ");
        Serial.println(count1++);
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}

void task2(void * parameters){
    for(;;){ // infinite loop
        Serial.print("Task 2 counter: ");
        Serial.println(count2++);
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}

void setup(){
	xTaskCreate(
        task1,    // Function that should be called
        "Task 1", // Name of the task (for debugging)
        1000,     // Stack size (bytes)
        NULL,     // Parameter to pass
        1,        // Task priority
        NULL      // Task handle
  );

	xTaskCreate(
        task2,    // Function that should be called
        "Task 2", // Name of the task (for debugging)
        1000,     // Stack size (bytes)
        NULL,     // Parameter to pass
        1,        // Task priority
        NULL      // Task handle
  );
}

void loop(){}
{% endhighlight %}

## Useful resources

* FreeRTOS homepage: [https://www.freertos.org](https://www.freertos.org)
* Documentation for the FreeRTOS implementation for ESP32: [https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/system/freertos.html](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/system/freertos.html)

