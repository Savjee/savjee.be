---
layout: post
title: "Tuya IR Hub: control Daikin AC (Home Assistant + ESPHome)"
quote:
tags: [Home Assistant, Smart Home, ESPHome]
thumbnail: /uploads/2020-09-tuya-ir-hub-daikin-ac-home-assistant-esphome/thumb_timeline.jpg
upload_directory: /uploads/2020-09-tuya-ir-hub-daikin-ac-home-assistant-esphome
---

The release of [ESPHome v1.15](https://esphome.io/changelog/v1.15.0.html#changelog-version-1-15-0-september-13-2020) brought better support for infrared climate control. This was enough to finally make my YTF IR Hub useable. Here's how I flashed ESPHome onto it and how I configured it for my Daikin AC and Home Assistant.

<!--more-->

## Hardware
Here's the situation. I have a Daikin AC unit in my office. It's used for both heating and cooling and comes with this <del>beautiful</del> remote control:

![Daikin AC remote control](/uploads/2020-09-tuya-ir-hub-daikin-ac-home-assistant-esphome/daikin-ac-remote.jpg)
*Fancy old-school remote!*

The goal is to replace this remote and be able to control the AC through Home Assistant. That way I can automate the hell out of it!

I thought about buying a second **Logitech Harmony Hub**, but I couldn't justify the $80+ price tag. It's essentially a plastic box with some infrared LEDs and a mediocre app (seriously Logitech, fix that app).

I also thought about buying a **Sensibo** (since I see their ads everywhere) but those are equally overpriced. There is [a Home Assistant integration](https://www.home-assistant.io/integrations/sensibo/) for them, but it updates through their cloud. 🤢

Instead, I found a variety of cheap IR hubs on AliExpress and I bought a Tuya-based hub:

![Various Tuya-based IR hubs on AliExpress](/uploads/2020-09-tuya-ir-hub-daikin-ac-home-assistant-esphome/tuya-ir-hubs-on-aliexpress.png)
*Various Tuya-based IR hubs on AliExpress*

They're sold by different brands, but the hardware is exactly the same. Here are three links to different hubs:

* [Moes](https://www.aliexpress.com/item/4000204281213.html?spm=a2g0o.productlist.0.0.4483246eLDlrTP&ws_ab_test=searchweb0_0%2Csearchweb201602_%2Csearchweb201603_&algo_pvid=ee726949-f626-4d01-9338-ce8349f8926b&aff_platform=portals-tool&btsid=0bb0623216001702163074037eea74&sk=_dTG7WYr&aff_trace_key=a2a56b7552c541d5886e48a282891af5-1600170253159-06305-_dTG7WYr&terminal_id=1323be6134464f9ebee208309bc3703d&tmLog=new_Detail&algo_expid=ee726949-f626-4d01-9338-ce8349f8926b-1) -> €10,61 (this is the one I bought)
* [AVATTO](https://www.aliexpress.com/item/4000719809991.html?spm=a2g0o.productlist.0.0.4483246eLDlrTP&ws_ab_test=searchweb0_0%2Csearchweb201602_%2Csearchweb201603_&algo_pvid=ee726949-f626-4d01-9338-ce8349f8926b&aff_platform=portals-tool&btsid=0bb0623216001702163074037eea74&sk=_dSHM4iF&aff_trace_key=34be0ddc780c4825a24029dcb38e8b19-1600170288921-09613-_dSHM4iF&terminal_id=1323be6134464f9ebee208309bc3703d&tmLog=new_Detail&algo_expid=ee726949-f626-4d01-9338-ce8349f8926b-0) -> €7,89
* [MoesHouse](https://www.aliexpress.com/item/4000202572807.html?spm=a2g0o.productlist.0.0.4483246eLDlrTP&ws_ab_test=searchweb0_0%2Csearchweb201602_%2Csearchweb201603_&algo_pvid=ee726949-f626-4d01-9338-ce8349f8926b&aff_platform=portals-tool&btsid=0bb0623216001702163074037eea74&sk=_dUXyY8f&aff_trace_key=831beb28219343edb5fd4d98a6a9f2b9-1600170330800-02422-_dUXyY8f&terminal_id=1323be6134464f9ebee208309bc3703d&tmLog=new_Detail&algo_expid=ee726949-f626-4d01-9338-ce8349f8926b-13) -> €7,27

Comparable models are available on Amazon, although at a higher price.

## Why Tuya?
Why not buy a Broadlink device that is natively supported by Home Assistant?

Well, these Tuya devices are super interesting because they're based on the ESP8266 chip, which means I can flash Tasmota or ESPHome onto them.

That way, everything is running on my local network. No (Chinese) cloud connection required and no dependency on the goodwill of manufacturers to keep their clouds running and firmware maintained.

Plus, they're cheaper than Broadlink units. (I'm a cheapskate 😉)

The only downside to flashing your own firmware is that you don't get access to their database of IR codes. But that's no big deal, because I only want to control my AC. Both ESPHome and Tasmota support that natively!

## ESPHome configuration
Before we can flash a custom firmware on this IR hub, we need to compile one. That means writing some YAML configuration!

I'm using the ESPHome add-ons for Home Assistant to write my configuration, compile a firmware and update my devices.

This is not a complete guide on how to get started with ESPHome. Check out [this tutorial](https://esphome.io/guides/getting_started_hassio.html) if you're new to it.

Let's start with the main configuration that I use on all my devices. It gives them a name, connects them to WiFi and enabled Home Assistant integration:

```yaml
esphome:
  name: ir_office
  platform: ESP8266
  board: esp01_1m

wifi:
  ssid: !secret wifi_iot_ssid
  password: !secret wifi_iot_password

captive_portal:
logger:

api:
  password: !secret esphome_api_password

ota:
  password: !secret esphome_api_password
```

The IR hub contains 3 main components that we have to configure: the status LED, the infrared receiver and the infrared emitter. I got the GPIO pin numbers for them from the [Tasmota documentation](https://tasmota.github.io/docs/devices/YTF-IR-Bridge/):

```yaml
# Use the blue LED as a status light.
#   Blink slowly = Temporary issue (WiFi/MQTT disconnected, sensor unavailable, ...)
#   Blink quickly = Error encountered
status_led:
  pin: GPIO4

# Configure the IR receiver. Handy to pickup confirmation messages
# from your AC (or capture commands from the actual remote)
remote_receiver:
  id: rcvr
  pin: 
    number: GPIO5
    inverted: True
  dump: all

# Configure the IR LED: this one sends commands to other devices
remote_transmitter:
  pin: GPIO14
  carrier_duty_percent: 50%
```

With this configuration you'll be able to send and capture raw IR signals. All that's left is to expose this as a `climate` component to Home Assistant. It's as simple as adding 4 lines:

```yaml
# Configure the AC unit you have. Mine is a Daikin. Other supported brands are listed here:
# https://esphome.io/components/climate/ir_climate.html?highlight=climate
#
climate:
  - platform: daikin
    name: "Office AC"
    receiver_id: rcvr
```

With that, the ESPHome configuration is finished and can be compiled. In the ESPHome add-on, go to your device, click the three dots and click "Compile".

![Compiling an ESPHome firmware](/uploads/2020-09-tuya-ir-hub-daikin-ac-home-assistant-esphome/esphome-compile-firmware.png)

After compilation, click "Download binary" to get the `.bin` file:

![Succesfull ESPHome compilation](/uploads/2020-09-tuya-ir-hub-daikin-ac-home-assistant-esphome/esphome-download-firmware.png)

## Tuya convert
Now we can flash the custom firmware onto the hub. You can do this in 2 ways:

* Open up the device and solder cables to the RX and TX pins so you can use a USB to Serial adapter.
* Use [tuya-convert](https://github.com/ct-Open-Source/tuya-convert) to flash a custom firmware over the air.

Although I'm good at using a soldering iron, I prefer not to open up devices when I don't have to.

So I busted out an old Raspberry Pi 3B+, installed an older version of Raspbian ([Stretch](http://downloads.raspberrypi.org/raspbian/images/raspbian-2019-04-09/2019-04-08-raspbian-stretch.zip) is the officially supported version for Tuya Convert) and ran through the instructions.

This post is by no means a step-by-step guide for Tuya convert but their [README file](https://github.com/ct-Open-Source/tuya-convert/blob/master/README.md) is very comprehensive and relatively short. I got mine done in about 15 minutes (excluding the time it took to install the Pi).

Just remember to use your own `bin` file instead of the Tasmota firmware mentioned in the instructions ;)

## Home Assistant integration
After flashing the firmware, your device should reboot and come online in about 1 minute. Mine got immediately discovered by Home Assistant:

![Home Assistant automatically discovered my IR Hub](/uploads/2020-09-tuya-ir-hub-daikin-ac-home-assistant-esphome/home-assistant-esphome-discovery.png)
*Home Assistant automatically discovered my IR Hub*

With no additional configuration in Home Assistant, ESPHome exposes a `climate` device to Home Assistant. Including the supported operations (heating, cooling, drying, fan), fan speed and swing mode.

![Home Assistant showing my Daikin AC!](/uploads/2020-09-tuya-ir-hub-daikin-ac-home-assistant-esphome/home-assistant-daikin-ac-climate.png)
*Home Assistant showing my Daikin AC!*

The only limitation is that it doesn't capture the current temperature of the room. That's because the IR signals are not bi-directional: the AC doesn't send status messages back (I think no AC unit does that?).

Luckily, I have [cheap Xiaomi/Aqara temperature sensors](https://www.aliexpress.com/item/4001231005225.html?aff_platform=shareComponent-detail&sk=_dZ7b5ph&aff_trace_key=78cc85dede9347ba919514d5aba8574e-1600352382157-04906-_dZ7b5ph&terminal_id=1323be6134464f9ebee208309bc3703d&tmLog=new_Detail) in all rooms to use as an alternative.

![Aqara temperature sensor (Zigbee)](/uploads/2020-09-tuya-ir-hub-daikin-ac-home-assistant-esphome/xiaomi-aqara-temperature-sensor-zigbee.jpg)

However, the default [thermostat card](https://www.home-assistant.io/lovelace/thermostat/) does not support using a custom temperature sensor. So I'm stuck with this:

![Home Assistant's thermostat control UI](/uploads/2020-09-tuya-ir-hub-daikin-ac-home-assistant-esphome/home-assistant-thermostat-card.png)
*0°C is a bit chilly for an office!*

I [reported this to the development team](https://github.com/home-assistant/frontend/issues/7036), so let's hope they'll add that capability! 

In the meantime, I'm using a custom card called [simple-thermostat](https://github.com/nervetattoo/simple-thermostat):

![My simple-thermostat setup](/uploads/2020-09-tuya-ir-hub-daikin-ac-home-assistant-esphome/home-assistant-simple-thermostat-card.png)
*My simple-thermostat setup*

It's not as pretty as the default one, but it allows to use another temperature sensor. Here's the configuration for it:

```yaml
type: 'custom:simple-thermostat'
entity: climate.office_ac
name: Airco Bureau
step_layout: row
step_size: 1
hide:
  temperature: true
sensors:
  - entity: sensor.temperature_bureau
    name: Temperature
  - entity: sensor.humidity_bureau
    name: Humidity
```

On my start page, I'm showing a [button-text-card](https://github.com/Savjee/button-text-card) to remind me that the AC is on. Clicking on it, redirects me to the climate control page.

![Home Assistant button-text-card screenshot](/uploads/2020-09-tuya-ir-hub-daikin-ac-home-assistant-esphome/home-assistant-button-text-card.png)
*Shameless plug. I developed button-text-card ;)*

The configuration for it:

```yaml
entity: climate.office_ac
hide_condition: |
  [[[ return entity.state === "off" ]]]
icon: 'mdi:air-conditioner'
title: Airco staat aan
subtitle: >
  [[[ return entity.state.charAt(0).toUpperCase() + entity.state.slice(1) + ' -
  ' + entity.attributes.temperature + '°C']]]
type: 'custom:button-text-card'
tap_action:
  action: navigate
  navigation_path: /lovelace/climate
```

## Using the remote
But what about the Wife Approval Factor? What if she uses the old-school remote instead? Does that screw up the system?

Nope, not at all! The IR Hub will pick up on the commands you send with the regular remote and update the state in Home Assistant. Sweet!

This works, because I've defined a `receiver_id` in the `climate` component of ESPHome.

![](/uploads/2020-09-tuya-ir-hub-daikin-ac-home-assistant-esphome/daikin-ac-remote.jpg)

Even though I don't use the remote anymore, I still could. And it helps massively with the wife-approval-factor. She doesn't need to unlearn something or change the way she interacts with the AC. Home Assistant is a nice-to-have addition for her.

## Why not use Tasmota?
Why not use Tasmota instead of ESPHome? 

Tasmota recognizes the IR commands for my Daikin AC, and even decodes them into JSON showing all the control options.

However, I found that integrating it with Home Assistant is way harder. You have to go through MQTT, and currently there is no way of create a `climate` component in Home Assistant that supports sending different IR commands (based on temperature, mode, fan speed, ...)

Instead, you need a custom integration like [SmartIR](https://github.com/hristo-atanasov/Tasmota-IRHVAC) or [Tasmota-IRHVAC](https://github.com/hristo-atanasov/Tasmota-IRHVAC). I try to avoid using custom integrations when there are other "vanilla" options available.

That's when ESPHome came into the picture. Very easy to configure, support for Daikin's IR codes and 1-click integration with Home Assistant. I'm sounding like a fanboy, aren't I?

ESPHome also supports other brands of AC units. Take a look at their [IR Climate Control](https://esphome.io/components/climate/ir_climate.html) documentation page for more details.

## Conclusion
So that's my smart-ish AC setup. Home Assistant now allows me to automate the AC, turn it on/off automatically, sending me notifications when it was left on, etc.

Have thoughts, ideas or questions? Let me know in the comments below!
