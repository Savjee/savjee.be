---
layout: post
title: "Smart lights behind a wall switch (Shelly + ESPHome)"
description: "Keep your physical wall switches functional even with smart bulbs. A guide on using Shelly and ESPHome to merge physical and smart lighting control."
tags: ["Home Assistant", "ESPHome", "Shelly"]
quote:
thumbnail: /uploads/2022-10-smart-lights-behind-wall-switch/thumb_timeline.jpg
upload_directory: /uploads/2022-10-smart-lights-behind-wall-switch
---

Using smart light bulbs means you can no longer use your physical wall switches because the bulbs need constant power. I think that's pretty dumb. Using a physical switch can be way faster than using an app to control the lights.

Here's how you can put a Shelly in between the switch and bulb so that you can use both in harmony.

<!--more-->

> I believe home automation should only *add* functionality to your existing infrastructure, not take options away.
> Installing smart lights is cool, but they should allow you to keep using the wall switches as well.

## Wiring
Start by connecting the Shelly to the wall switch and the smart lights as intended. Connect the Shelly to mains power, the light bulb to the output terminal, and the switch to the `SW` input:

![](/uploads/2022-10-smart-lights-behind-wall-switch/shelly-wiring-diagram.svg)

This is the standard setup for any Shelly switch. However, with the default firmware, the Shelly will toggle the light whenever the switch is toggled. That's not what I want, so ESPHome to the rescue!

*Note: If you want to flash ESPHome to your Shelly devices, check out [my blog post about how to flash it over-the-air]({% link collections.posts, "2020-09-22-shelly-2.5-flash-esphome-over-the-air.md" %}). No wires needed!*

## The ESPHome Magic™
With ESPHome you can run automations on the Shelly itself. Here, I want the Shelly to send an event to Home Assistant whenever we use the wall switch. This can trigger an automation, which can turn on the smart light through Zigbee or whatever protocol it’s using.

However, when Home Assistant is not available (offline or the WiFi network is out), I want the Shelly to take control of the lights by toggling the relay inside. It doesn't happen often, but I don't want to sit in the dark when I mess up my Home Assistant configuration.

Here's a visualization of the automation:

![](/uploads/2022-10-smart-lights-behind-wall-switch/esphome_automation_visualized.svg)

And here is the ESPHome configuration to make that happen:

```yaml
substitutions:
  devicename: shelly1-living
  friendly_name: Living
  channel_1: Living spots

esphome:
  name: $devicename
  platform: ESP8266
  board: esp01_1m

output:
  # The relay
  - platform: gpio
    pin: GPIO4
    id: shelly_1_relay

light:
  # Expose the relay as a light to Home Assistant
  - platform: binary
    name: $light_name
    output: shelly_1_relay
    id: light_1

binary_sensor:
  # This switch is connected to IKEA GU10 light bulbs which ideally are always
  # powered on. This configuration is made in a way, that if Home Assistant is
  # not connected, the Shelly takes over the relay. Otherwise, we rely on an
  # automation in Home Assistant.
  - platform: gpio
    pin: GPIO5
    name: "${channel_1} input switch"
    internal: true  # Don't need switch state in HA
    filters:
      - delayed_on_off: 150ms

    # When the switch is toggled, check if we have a WiFi connection
    # and if Home Assistant is connected to the API
    on_state:
      then:
        if:
          condition:
            - wifi.connected: ~
            - api.connected: ~
          # If there's WiFi and HA is connected, make sure that the
          # relay is ON and send an event to Home Assistant. It's then
          # up to an automation to control the smart light.
          then:
            - light.turn_on: light_1
            - homeassistant.event:
                event: esphome.switch_pressed
                data:
                  slug: "${channel_1}"

		  # If the WiFi is down, or Home Assistant is not connected,
		  # take manual control of the relay!
          else:
            - light.toggle: light_1
```

*Note: I would love to take credit for this idea, but I found it in [Frenck's Home Assistant configuration repository](https://github.com/frenck/home-assistant-config/blob/18e6479d12ab7be6ba508c45be307062894b3ae7/esphome/living_room_window_switch.yaml) on GitHub.*

This ESPHome configuration is for the Shelly 1, but can easily be adapted for other Shelly devices. It can also work with push buttons instead of toggle switches, and you could even generate custom events when the button is held down, which could then dim the lights or do something else.


## Home Assistant automation
With events flowing into Home Assistant, we can now create an automation to actually control the smart lights (in my case a Zigbee bulb):

```yaml
- alias: "Control living spots through ESPHome events"
  trigger:
    - platform: event
	  event_type: esphome.switch_pressed
      event_data:
        slug: "Living spots"
  action:
    - service: light.toggle
      entity_id: light.living_spots_group
```

That's it!

I can now control my IKEA Zigbee switches with my dumb wall switch. And if things go wrong with Home Assistant or the WiFi, the Shelly will take control.

## Stock Shelly firmware
While I haven't tested this, you could achieve a similar setup by using the stock firmware. The [Shelly integration for Home Assistant](https://www.home-assistant.io/integrations/shelly/#events) also receives an event when you toggle your switch. Just set the button type to "detached".

The only limitation is that your wall switch won't work when Home Assistant (or your WiFi network) is down. But if you don't fancy flashing ESPHome to your devices, you might be okay with that.

## Conclusion
That's it. You can now use smart light bulbs WITH physical wall switches. No need to choose between them. And when shit hits the fan, the Shelly will gracefully take control of lights, so you never have to sit in the dark waiting for your WiFi or home automation system to come back online.

Credit goes to [Frenck for posting this approach on his GitHub](https://github.com/frenck/home-assistant-config/blob/18e6479d12ab7be6ba508c45be307062894b3ae7/esphome/living_room_window_switch.yaml).
