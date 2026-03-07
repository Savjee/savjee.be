---
layout: post
title: "Converting a Chinese Thermostat to ESPHome"
description: "How I replaced the cloud firmware on a cheap BK7231N thermostat with ESPHome for full local control in Home Assistant."
tags: [Home Assistant, ESPHome, Smart Home, DIY]
meta_tags: ["esphome thermostat", "bk7231n esphome", "libretiny thermostat", "chinese thermostat home assistant", "tp4w thermostat esphome"]
# thumbnail: /uploads/2026-02-converting-chinese-thermostat-to-esphome/thumb_timeline.jpg
toc_enabled: true
not_featureable: true
---

I bought a cheap Chinese thermostat to control an infrared heating panel in my office. It ticked all the boxes except one: it's a Tuya device which requires a cloud connection. That's a big no-no for me. So I ripped it apart, soldered some leads onto the PCB and flashed ESPHome onto it! Let's dig in.

<!--more-->

## Why an IR panel

First some context.

My office has central heating controlled by a Tado thermostat, but the signal in that room is terrible. It would regularly lose connection and stop heating entirely. Not great when you're trying to work in winter.

To stop myself from freezing to death, I bought a cheap 800W infrared heater. I'd heard good things about IR heating, and after trying it I was immediately sold. It makes you feel warm almost instantly even though the room is still cold.

Only problem: my IR panel has a basic on/off switch. No thermostat. I wanted to keep the switch permanently on and have a smart relay control it based on room temperature. I looked at Sonoff and Shelly devices, but even with mods, they don't look like a finished product you'd want to put in a wall socket.

## TP4W.WHITE
That's how I landed on the **TP4W.WHITE**: a cheap thermostat that looks nice, has a built-in relay, temperature sensor, and a nice LED display. It ticked all the boxes, except one. It's a Tuya device, meaning it can only be controlled through their cloud...

{% comment %}
![TODO: photo of the thermostat front](/uploads/2026-02-converting-chinese-thermostat-to-esphome/thermostat-front.jpg)
*The TP4W.WHITE thermostat. Looks surprisingly decent for the price.*
{% endcomment %}

I contacted the selled on AliExpress and asked which microncontroller was powering the device. I was hoping for an ESP8266 or ESP32. Instead, it's powered by a **BK7231N** microcontroller. I had never heard of that so I feared the worse. But it turns out, it's supported by ESPHome via LibreTiny. So I decided to buy it and see if I could flash ESPHome onto it.

## Flashing ESPHome
When the device arrived a few weeks later, I thought it was going to be a simple process. Use tuya-convert to flash ESPHome onto it, add it to Home Assistant, and work comfortably in my heated office.

But it turns out that getting tuya-convert to work is not straightforward and even requires Linux.

So instead, I opened up the device to see if it had exposed pins for flashing ESPHome directly. To my surprise, it did!


## Figuring out the pinout
At this point I had successfully flashed ESPHome onto the device and got it connected to Home Assistant. However, I still needed to figure out the pinout so I could read out the temperature sensor and control the relay. That turned out to be much harder than expected.

Before flashing ESPHome, I dumped the original firmware using [bk7231tools](https://github.com/tuya-cloudcutter/bk7231tools). I figured this would come in handy if I needed to revert back to the original firmware and to extract the pinout from.

LibreTiny even has [a tool](https://upk.libretiny.eu/)  to auto-generate an ESPHome config from the Tuya firmware, but unfortunately for me, it didn't work for this device.

> The chosen device doesn't contain pin configuration.
> 
> Possible causes:
> - it has vendor-specific firmware
> - it uses TuyaMCU (report error if that's the case!)
> 
> Auto-generating ESPHome YAML is not possible.

I must admit, I wasn't very hopeful when I saw this message. My electrical skills are limited, so figuring out the pinout myself would be challenging. I tried mapping all output pins to input_booleans in Home Assistant to see what happened when I turned them on. I quickly found out that the relay was connected to **P22**, but figuring out the display or temperature sensor was going to be much harder.

## Emailing the manufacturer (it actually worked!)
I decided to try emailing the manufacturer directly and explain the situation. Who knows, maybe they'd take pitty on a random European suffering in a cold home office.

AliExpress listed **ezAIoT** as the manufacturer. But in typical AliExpress fashion, that turned out to be a front company reselling someone else's product. I emailed them asking for the pinout but it bounced immediately.

After some digging, I found the actual manufacturer: **RTI-TEK**. I shot them an email, with the same question. To my surprise, they got back to me with the **full schematics**! I couldn't believe it.

Having the schematics made the rest of this process super simple!

## Configuring ESPHome
I already found out the relay is connected to **P22**, so that was the easy part:
```yaml
switch:
  - platform: gpio
    id: relay
    name: thermostat_relay
    pin: P22
    internal: true
```

I marked it as `internal` because I don't want the raw relay showing up in Home Assistant. Instead, I expose a proper thermostat climate entity that controls the relay (more on that later).


## Temperature sensor (NTC)

The thermostat has a built-in NTC thermistor for measuring room temperature, connected to the ADC on **P23** (labeled `ADC6` in the BK7231N datasheet).

Getting this to work required chaining three sensors in ESPHome: an ADC reads the raw voltage, a resistance sensor converts that to ohms, and an NTC sensor turns the resistance into a temperature using B-constant calibration:

```yaml
sensor:
  - platform: ntc
    sensor: resistance_sensor
    name: "Office Temperature"
    id: temperature_sensor
    calibration:
      b_constant: 3380
      reference_temperature: 25°C
      reference_resistance: 10kOhm

  - platform: resistance
    id: resistance_sensor
    sensor: source_sensor
    internal: true
    configuration: DOWNSTREAM
    resistor: 10kOhm

  - platform: adc
    id: source_sensor
    pin: ADC6
    internal: true
    update_interval: 30s
```

The schematics helpfully included the used resistor values and the b_constant. I compared the readings against a calibrated thermometer and they were within 0.5°C. It does heat up slightly after pro-longer use, but that's to be expected.

## The LED display

The thermostat has a segmented LED display showing the current temperature along with several indicators for things like WiFi, heating status, etc.

I don't necessarily need to the display to work, because I would mostly control this via Home Assistant, but it would be very nice to have it working.

The display is driven by a **GN1616** chip, which appears to be a clone of the **TM1638**. Lucky for me, ESPHome has built-in support for the TM1638.

However, getting it to work on the BK7231N required some help. I [opened an issue on the LibreTiny GitHub](https://github.com/libretiny-eu/libretiny/issues/334), and the maintainers got back to me quickly with a series of patches to make the TM1638 driver work on this chip. Open source at its finest.

The display connects via three pins:

```
STB (Strobe) -> P16
CLK (Clock)  -> P14
DIO (Data)   -> P28
```

While ESPHome does support the segment LED driver, it wasn't that easy. This device doesn't use all digits of the display as is. 

Through trial and error, I mapped out which bits control which segments and icons:

| Segment | Bit | Icon              |
| ------- | --- | ----------------- |
| 0       | 0   | ".5" indicator    |
| 0       | 1   | Snowflake icon    |
| 0       | 2   | Lightning bolt    |
| 1       | 0   | Clock icon        |
| 1       | 1   | Hourglass icon    |
| 1       | 2   | °C indicator      |
| 1       | 3   | Exchange icon     |
| 1       | 4   | SET indicator     |
| 1       | 5   | Sun icon          |
| 1       | 6   | WiFi icon         |

Armed with this mapping, I could write an ESPHome `display()` lambda to bring the display to life. I wanted to show useful info at a glance:

* **WiFi icon**: lights up when connected.
* **Hourglass icon**: shows while connecting to WiFi.
* **Sun icon**: lights up when the heater is active.
* **°C indicator**: always shown alongside the temperature.
* **".5" indicator**: lights up when the temperature has a half-degree.

Here's the lambda that drives the display. One quirk: the display renders characters in reverse order, so I had to account for that when formatting the temperature:

```yaml
display:
  - platform: tm1638
    id: thermostat_display
    stb_pin: P16
    clk_pin: P14
    dio_pin: P28
    update_interval: 1s
    intensity: 7
    lambda: |-
      static uint8_t segment_0 = 0;
      static uint8_t segment_1 = 0;

      segment_0 = 0;
      segment_1 = 0;

      // WiFi status
      if(id(wifi_connection).is_connected()) {
        segment_1 |= (1 << 6); // WiFi icon
      }else{
        segment_1 |= (1 << 1); // Hourglass icon
      }

      // Relay status
      if(id(relay).state) {
        segment_1 |= (1 << 5); // Sun icon
      }

      float temp = id(temperature_sensor).state;

      if(isnan(temp)) {
        id(thermostat_display).print(" -- ");
      }

      if (!isnan(temp)) {
        segment_1 |= (1 << 2); // °C symbol

        float rounded_temp = round(temp * 2.0) / 2.0;
        int temp_int = (int)rounded_temp;
        bool show_half = (rounded_temp - temp_int) >= 0.5;
        
        if (temp_int >= 10) {
          int digit1 = (temp_int / 10) % 10;
          int digit2 = temp_int % 10;
          char temp_str[5];
          snprintf(temp_str, sizeof(temp_str), "  %d%d", digit2, digit1);
          id(thermostat_display).print(temp_str);
        } else {
          char temp_str[5];
          snprintf(temp_str, sizeof(temp_str), "  %d", temp_int);
          id(thermostat_display).print(temp_str);
        }

        if (show_half) {
          segment_0 |= (1 << 0);  // .5 indicator
        }
      }

      id(thermostat_display).set_segments(0, segment_0);
      id(thermostat_display).set_segments(1, segment_1);
```

I'll be honest, bit-banging is not my strong suit. Most of this code was geneerated by AI. But hey, it works!

## Power consumption (pragmatic approach)

The thermostat has no power monitoring chip, so I can't measure actual consumption. But since it's always connected to the same infrared heater (rated at 800W), I took a pragmatic approach: hardcode it.

Relay on? Report 800W. Relay off? Report 0W. It's not elegant, but it feeds accurate data into Home Assistant's Energy dashboard, and that's all I need:

```yaml
sensor:
  - platform: template
    name: "Power"
    unit_of_measurement: "W"
    state_class: measurement
    device_class: power
    lambda: |-
      if (id(relay).state) {
        return 800.0;
      } else {
        return 0.0;
      }
    update_interval: 60s
```


## Climate entity

With the temperature sensor and relay working, I could create a proper thermostat using ESPHome's built-in `thermostat` climate platform:

```yaml
climate:
  - platform: thermostat
    id: climate_thermostat
    name: "Office"
    sensor: temperature_sensor
    visual:
      temperature_step: 
        target_temperature: 0.5
        current_temperature: 0.01
    min_heating_off_time: 30s
    min_heating_run_time: 30s
    min_idle_time: 30s
    heat_action:
      - switch.turn_on: relay
    idle_action:
      - switch.turn_off: relay
```

This gives me a full thermostat entity in Home Assistant where I can set the target temperature in 0.5°C increments. 

I love how ESPHome gives you complete control over the hysteresis logic. Cheap thermostat often turn on and off frequently when they reach their target temperature.

{% comment %}
![TODO: screenshot of the thermostat in Home Assistant](/uploads/2026-02-converting-chinese-thermostat-to-esphome/home-assistant-thermostat.png)
*The thermostat as it appears in Home Assistant. Clean and simple.*
{% endcomment %}


## What about the buttons?

The thermostat has four buttons on top: SET, Plus, Minus, and MODE. I haven't gotten these working. The schematic shows they're connected to the same GN1616 LED driver, but I couldn't get that to work with ESPHome's TM1638 driver.

But honestly, I don't care about the buttons. I control the heater almost exclusively through Home Assistant automations. On the rare occasion I adjust it manually, I do it through the Home Assistant app. The physical buttons are irrelevant to my setup, so I didn't spend a lot of time trying to get them working. If someone figures them out though, I'd love to hear about it!

## The full ESPHome configuration

Here's the complete config for reference:

```yaml
substitutions:
  devicename: "office-thermostat"
  friendly_name: "Office Thermostat"

packages:
  esphome: !include common/esphome.yaml
  api: !include common/api.yaml
  logger: !include common/logger.yaml
  wifi: !include common/wifi.yaml

external_components:
  - source: ./external_components

bk72xx:
  board: "generic-bk7231n-qfn32-tuya"
  framework:
    version: 0.0.0
    source: https://github.com/Savjee/libretiny.git#master

sensor:
  - platform: wifi_signal
    name: "WiFi Signal Sensor"
    update_interval: 60s
    disabled_by_default: true

  - platform: ntc
    sensor: resistance_sensor
    name: "Office Temperature"
    id: temperature_sensor
    calibration:
      b_constant: 3380
      reference_temperature: 25°C
      reference_resistance: 10kOhm

  - platform: resistance
    id: resistance_sensor
    sensor: source_sensor
    internal: true
    configuration: DOWNSTREAM
    resistor: 10kOhm
    name: Resistance Sensor

  - platform: adc
    id: source_sensor
    pin: ADC6
    internal: true
    unit_of_measurement: "V"
    update_interval: 30s

  - platform: template
    name: "Power"
    unit_of_measurement: "W"
    state_class: measurement
    device_class: power
    lambda: |-
      if (id(relay).state) {
        return 800.0;
      } else {
        return 0.0;
      }
    update_interval: 60s

display:
  - platform: tm1638
    id: thermostat_display
    stb_pin: P16
    clk_pin: P14
    dio_pin: P28
    update_interval: 1s
    intensity: 7
    lambda: |-
      static uint8_t segment_0 = 0;
      static uint8_t segment_1 = 0;

      segment_0 = 0;
      segment_1 = 0;

      if(id(wifi_connection).is_connected()) {
        segment_1 |= (1 << 6);
      }else{
        segment_1 |= (1 << 1);
      }

      if(id(relay).state) {
        segment_1 |= (1 << 5);
      }

      float temp = id(temperature_sensor).state;

      if(isnan(temp)) {
        id(thermostat_display).print(" -- ");
      }

      if (!isnan(temp)) {
        segment_1 |= (1 << 2);

        float rounded_temp = round(temp * 2.0) / 2.0;
        int temp_int = (int)rounded_temp;
        bool show_half = (rounded_temp - temp_int) >= 0.5;
        
        if (temp_int >= 10) {
          int digit1 = (temp_int / 10) % 10;
          int digit2 = temp_int % 10;
          char temp_str[5];
          snprintf(temp_str, sizeof(temp_str), "  %d%d", digit2, digit1);
          id(thermostat_display).print(temp_str);
        } else {
          char temp_str[5];
          snprintf(temp_str, sizeof(temp_str), "  %d", temp_int);
          id(thermostat_display).print(temp_str);
        }

        if (show_half) {
          segment_0 |= (1 << 0);
        }
      }

      id(thermostat_display).set_segments(0, segment_0);
      id(thermostat_display).set_segments(1, segment_1);

climate:
  - platform: thermostat
    id: climate_thermostat
    name: "Office"
    sensor: temperature_sensor
    visual:
      temperature_step: 
        target_temperature: 0.5
        current_temperature: 0.01
    min_heating_off_time: 30s
    min_heating_run_time: 30s
    min_idle_time: 30s
    heat_action:
      - switch.turn_on: relay
    idle_action:
      - switch.turn_off: relay
  
switch:
  - platform: gpio
    id: relay
    name: thermostat_relay
    pin: P22
    internal: true
```


## Conclusion

What started as a simple "flash ESPHome onto a thermostat" project turned into a deeper dive involving custom firmware patches, display driver reverse-engineering, and a surprisingly helpful Chinese manufacturer.

And if you're stuck figuring out a pinout, don't be afraid to email the manufacturer. You might be surprised. Just make sure you're emailing the *actual* manufacturer, not the AliExpress reseller.

I'm super grateful for the manufacturer's help! Their willingness to share schematics and answer questions was key to making this work.
