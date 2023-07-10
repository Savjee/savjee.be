---
title: "Keep WiFi Connection Alive with a FreeRTOS Task"
videoId: YSGPcm-qxDA
duration: 375
order: 26
uploadDate: 2021-02-09
section: "FreeRTOS"
---

Does your ESP32 need a constant WiFi connection? Use a FreeRTOS task to constantly check your connection, and re-establish it when needed.

This code has been super robust for me. I've been using it for [my Home Energy Monitor]({% link collections.posts, "2020-02-11-home-energy-monitor-v2.md" %}), and it has been running reliably for years.

[I also have a dedicated blog post about this technique]({% link collections.posts, "2020-02-17-esp32-keep-wifi-alive-with-freertos-task.md" %}).

## Full code

{% highlight cpp %}
#define WIFI_NETWORK "--- your WiFi network name ---"
#define WIFI_PASSWORD "--- your WiFi password ---"
#define WIFI_TIMEOUT_MS 20000 // 20 second WiFi connection timeout

void keepWiFiAlive(void * parameter){
    for(;;){
        if(WiFi.status() == WL_CONNECTED){
            Serial.println("WiFI still connected.");
            vTaskDelay(10000 / portTICK_PERIOD_MS);
            continue;
        }

        Serial.println("WiFi Connecting");
        WiFi.mode(WIFI_STA);
        WiFi.begin(WIFI_NETWORK, WIFI_PASSWORD);

        unsigned long startAttemptTime = millis();

        // Keep looping while we're not connected and haven't reached the timeout
        while (WiFi.status() != WL_CONNECTED && 
                millis() - startAttemptTime < WIFI_TIMEOUT_MS){}

        // When we couldn't make a WiFi connection (or the timeout expired)
        // sleep for a while and then retry.
        if(WiFi.status() != WL_CONNECTED){
            Serial.println("[WIFI] FAILED");
            vTaskDelay(WIFI_TIMEOUT_MS / portTICK_PERIOD_MS);
            continue;
        }

        Serial.println("[WIFI] Connected: " + WiFi.localIP());
    }
}
{% endhighlight %}


## Useful resources

* FreeRTOS homepage: [https://www.freertos.org](https://www.freertos.org)
* Documentation for the FreeRTOS implementation for ESP32: [https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/system/freertos.html](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/system/freertos.html)

