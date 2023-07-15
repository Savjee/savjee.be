---
title: "Manage FreeRTOS tasks - Suspend, Delay, Resume, Delete"
videoId: jJaGRCgDo9s
duration: 347
order: 25
date: 2021-02-09
section: "FreeRTOS"
---

Once you have FreeRTOS tasks running, you might want to manage them. The scheduler can stop, suspend, and resume individual tasks. You can control tasks from within or you can use task handles to control them from anywhere in your code.

## Task handles

Using task handles:
{% highlight cpp %}
// Define a task handle and initialize it to NULL
TaskHandle_t task_handle = NULL;

// Create the task, and pass the task handle as last parameter
// to xTaskCreate (pointer):
xTaskCreate(
    task1,         // Function that should be called
    "Task 1",      // Name of the task (for debugging)
    1000,          // Stack size (bytes)
    NULL,          // Parameter to pass
    1,             // Task priority
    &task1_handle  // Task handle
);
{% endhighlight %}

## Stopping a task

{% highlight cpp %}
// From within the task itself:
vTaskDelete(NULL);

// From the outside (with a task handle)
vTaskDelete(task_handle);
{% endhighlight %}

## Suspending & resuming a single task

{% highlight cpp %}
// Suspend a task within the task itself:
vTaskSuspend(NULL);

// Suspend a task from the outside
vTaskSuspend(task_handle);

// Resume a task (only possible from the outside)
vTaskResume(task_handle);
{% endhighlight %}

## Suspend all tasks & resume all tasks
If you have time-sensitive code, you might want to temperorily pause all other tasks while executing it.

{% highlight cpp %}
void superImportantTask(){
    vTaskSuspendAll();

    // Do something really important here
    // (Code that's timing sensitive and should
    // not be interrupted by FreeRTOS)

    // Resume all tasks again
    xTaskResumeAll();
}
{% endhighlight %}

## Useful resources

* FreeRTOS homepage: [https://www.freertos.org](https://www.freertos.org)
* Documentation for the FreeRTOS implementation for ESP32: [https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/system/freertos.html](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/system/freertos.html)

