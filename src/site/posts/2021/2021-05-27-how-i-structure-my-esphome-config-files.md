---
layout: post
title: "How I Structure My ESPHome Config Files"
description: "How I organize 24+ ESPHome devices with a modular YAML structure. Best practices for configuration files to avoid copy-paste and maintain consistency."
quote: 
tags: [ESPHome, Home Assistant]
upload_directory: /uploads/2021-05-27-how-i-structure-my-esphome-config-files/
thumbnail: /uploads/2021-05-27-how-i-structure-my-esphome-config-files/thumb_timeline.jpg
---

I'm a big fan of ESPHome. I have 24 devices running it, and I only buy new IoT devices when I know they can run ESPHome.

ESPHome is a modular firmware that you have to configure with YAML files. You define what components it should load and how it should talk to the hardware of your device (GPIO pins, LEDs, relays, sensors, Home Assistant integration...)

However, YAML files can get messy quickly. With 24 devices running, I spent a lot of time coming up with a proper structure to add new devices and change the behavior of existing ones without having to copy-paste the same things repeatedly.

<!--more-->

Here's an overview of the structure I came up with:

![My ESPHome YAML config structure](/uploads/2021-05-27-how-i-structure-my-esphome-config-files/esphome_config_structure.svg)

## Base configuration
It starts with the base configuration, which contains settings for all my ESPHome devices, regardless of their type, function, or brand.

It contains the configuration for my WiFi network, fallback access point, API for Home Assistant, and over-the-air updates.

The `.base.yaml` file looks like this:

```yaml
---
wifi:
  ssid: !secret wifi_iot_ssid
  password: !secret wifi_iot_password

  # Enable fallback hotspot (captive portal) in case wifi connection fails
  ap:
    ssid: ${friendly_name} AP
    password: !secret esphome_fallback_ap_password

captive_portal:

# Enable logging
logger:

# Enable Home Assistant API
api:
  password: !secret esphome_api_password

ota:
  password: !secret esphome_api_password
```

## Base device configuration
Next up: is the base device configuration. Here, I configure all the items that are the same for one particular type of device.

For instance, here is my config file for the Shelly 1 (`.base.shelly1.yaml`):

```yaml
---
esphome:
  name: $devicename
  platform: ESP8266
  board: esp01_1m

# Device Specific Config
output:
  - platform: gpio
    pin: GPIO4
    id: shelly_1_relay

light:
  - platform: binary
    name: $light_name
    output: shelly_1_relay
    id: lightid

binary_sensor:
  - platform: gpio
    pin:
      number: GPIO5
    name: "Switch Shelly 1"
    on_state:
      then:
        - light.toggle: lightid
    internal: true
    id: switchid
```

It defines which platform is used (ESP8266 or ESP32) and the type of board, and how much memory it has (`esp01_1m`).

It also configures the relay and input pin of the Shelly 1, and exposes this as a `light` to Home Assistant.

## Actual configuration
And finally, we arrive at the configuration file for an actual device.

Here's the configuration for a Shelly 1 that controls my office lights (`shelly1-office.yaml`):

```yaml
---
substitutions:
  devicename: office
  light_name: Office
  friendly_name: Office Light

<<: !include .base.yaml
<<: !include .base.shelly1.yaml
```

It defines the name of the device, the name of the lights, and a friendly name. At the bottom, I import the base file (with generic configuration) and the generic configuration for all Shelly 1 devices.

## File structure
I'm using the ESPHome add-on for Home Assistant to manage and update my devices. All of my configuration files are stored in my Home Assistant instance, and here's what the file structure looks like:

```
esphome
├── .base.yaml
├── .base.shelly1.yaml
├── .base.shelly25.yaml
├── .base.sonoff-mini.yaml
├── shelly1-garage-door.yaml
├── shelly1-office-lights.yaml
├── shelly25-kitchen-lights.yaml
├── sonoff-mini-backdoor-light.yaml
└── sonoff-mini-garage-lights.yaml
```

I put a dot in front of the base files so that they would be grouped together at the top of a directory listing. This is just a personal preference.

I also have a naming convention for my config files to help me quickly find the file I need:

```
[device type]-[room in the house]-[description]
```

## Conclusion
This structure prevents you from having to copy-paste the same config items over and over again. It's also easy to tweak the behavior of specific devices. If I want all my Shelly's to report the state of the input to Home Assistant, I can change that in the `.base.shelly1.yaml` file, and I'm done!

Note that this structure is rigid, and some limitations come with it. For instance: you can't define `sensor` items in multiple configuration files as they'll overwrite each other.