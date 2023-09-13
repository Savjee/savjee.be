---
layout: post
title: "Make Your Garage Door Opener Smart: Shelly 1, ESPHome and Home Assistant"
quote:
tags: [Home Assistant, Smart Home, DIY, ESPHome, Shelly]
meta_tags: ["garage door opener", "smart garage door", "home assistant garage door", "esphome garage door"]
thumbnail: /uploads/2020-06-smart-garage-door-shelly-home-assistant/poster-750.jpg
upload_directory: /uploads/2020-06-smart-garage-door-shelly-home-assistant
toc_enabled: true
---

I've been adding more and more devices to my smart home lately, so naturally, my garage door opener had to follow. But instead of swapping it out for a new unit, I used a Shelly 1 and a cheap door contact sensor to make it smart for less than $20!

It runs ESPHome (open-source, no cloud) and integrates seamlessly with Home Assistant. Here's how I did it.

<!--more-->

## Meet my garage door opener 
This is my "dumb" garage door opener. It's from FAAC and is only controllable with the included RF remotes. 

![FAAC Garage Door Opener](/uploads/2020-06-smart-garage-door-shelly-home-assistant/garage-door-opener-faac.jpg)
*My "dumb" FAAC garage door opener is about to get smart!*

But don't worry, these instructions should work with every single brand of garage door openers (including Hörmann, Genie, LiftMaster, Chamberlain, ...).

The only requirement is that the opener must have an input for a wall switch. As far as I know, all operators have this, yay!

## Goals: What I want
Before starting, let me tell you what I wanted to accomplish by making the garage smart:

* Be able to open the garage door with my phone, so I don't have to carry a remote (or worry about forgetting the damn thing).
* I want to have fun with automations. Get an actionable notification when I arrive with the car, automatically close it when it's left open…
* Add it to the home security system so I can be alerted when the garage opens when it shouldn't.

But most importantly, the "smart" garage door should adhere to my smart home policy:

> Making things "smart" should only add a new layer of control, not replacing existing ones. Smart lights should be controllable with the regular wall switches. A smart garage door should still work with the remote.  

This rule also massively boosts the [Wife Approval Factor](https://en.wikipedia.org/wiki/Wife_acceptance_factor) ;)

## What you'll need

* WiFi (+ coverage in the garage)
* [Shelly 1](https://shelly.cloud/products/shelly-1-smart-home-automation-relay/) (smart switch)
* Wired magnetic door contact sensor (any brand is fine)

### Shelly 1
Most garage door openers allow you to connect a wall-switch to open and close it. That way, it's easy to open your garage from the inside by just pressing a switch.

So my idea was simple: have a [Sonoff Mini](https://sonoff.tech/product/wifi-diy-smart-switches/sonoff-mini) act as a switch to open and close the garage. 

One problem though: the Sonoff doesn't have dry contacts. It forces you to push 110/230V to the connected device, and that will fry most garage door openers. Most models use a volt-free contact or 12-24V DC power.

Instead, I went with a [Shelly 1](https://shelly.cloud/products/shelly-1-smart-home-automation-relay/). It's a bit smaller than the Sonoff, and it exposes both sides of the relay (input & output). Meaning you can switch any voltage (within reason) and are not limited to 110 or 230V.

![Sonoff Mini vs. Shelly 1. Roughly the same size and functionality.](/uploads/2020-06-smart-garage-door-shelly-home-assistant/shelly1-vs-sonoff-mini.jpg)
*Sonoff Mini vs. Shelly 1. Roughly the same size and functionality, except for dry-contacts.*

Another bonus point for the Shelly; it can be powered by 110-230V (AC) OR with 12-60V (DC). My garage door opener happens to have a 24V output. Perfect to completely hide the Shelly inside!

### Magnetic Door Contact Sensor
I also bought a magnetic door sensor to sense the state of the garage door. This is entirely optional, but it's a cheap way to know if your garage is open or closed.

I ordered [this one from Amazon with a 2 meter cable](https://www.amazon.de/ABUS-MK2000-Zubehör-Sicherheitssystem-verdrahtet/dp/B000ZGA0WW/ref=sr_1_3?dchild=1&keywords=abus+türkontakt&qid=1593002334&sr=8-3), but any wired contact sensor will work:

![Magnetic door contact sensor](/uploads/2020-06-smart-garage-door-shelly-home-assistant/magnetic-door-contact-sensor.jpg)
*Magnetic door contact sensor*

You could also use wireless door sensors (Zigbee) and use a [Template Cover](https://www.home-assistant.io/integrations/cover.template/) in Home Assistant to combine them. However, I prefer wired solutions wherever I can (no batteries to replace).

I then attached the sensor to the garage door pulley (black plastic parts in the photo). As soon as the garage door opens just a few centimeters, the contact is broken, and the state can be updated.

![Contact sensor attached to the "pulley" of my garage door opener & metal frame.](/uploads/2020-06-smart-garage-door-shelly-home-assistant/contact-sensor-on-garage-door-pulley.jpg)
*Contact sensor attached to the "pulley" of my garage door opener & metal frame.*

## Wiring
Connecting the Shelly to your garage door opener and the contact sensor is relatively easy:

* Power the Shelly with 24-60V DC.
* Connect the contact sensor to `SW` and ground of the Shelly.
* Connect your garage door opener's switch contact to the input `I` and output `O` of the Shelly.

> Please be careful when wiring this all up. Disconnect your garage door opener from mains, so you don't get hurt! It would be a shame to get electrocuted before being able to test it ;)

{% comment %}
When using 110V or 230V, the wiring is pretty straightforward. Connect the phase to `L` and neutral to `N`.

> Warning: the Shelly puts main voltage on the `SW` input and these contact switches aren't rated for such high voltages. If you're using 110-230V, use the GPIO3 and Ground pins instead. Thanks, [photinus on Reddit](https://www.reddit.com/r/homeassistant/comments/hfox2e/make_your_garage_door_opener_smart_shelly_1/fvz5m7z/) for pointing this out!

![Connect Shelly to Garage Door with AC power](/uploads/2020-06-smart-garage-door-shelly-home-assistant/shelly-schematic-ac.png)
*Connect Shelly to AC power. Be careful not to put 110-230V on the contact sensor! Only use the neutral line.*
{% endcomment %}

When you use DC power, Shelly's `L` becomes the negative wire, and the `N` becomes the positive one. This is exactly the opposite of AC wiring, so be sure you don't get them mixed up.

The contact sensor still has to be connected to `SW`, but the other end should now be connected to `L`, which is Shelly's negative wire when using DC power.

![Connect Shelly to Garage Door with DC power](/uploads/2020-06-smart-garage-door-shelly-home-assistant/shelly-schematic-dc.png)
*Connect Shelly to DC power. Watch out: L is now negative, while N is positive.*

> Warning: you can run the Shelly on 110-230V, but not with this contact sensor. The Shelly puts main voltage on the `SW` input and the sensor isn't rated for that voltage! So please stick to DC or buy an appropriate contact switch.

## Custom firmware: ESPHome
Next up: flashing a custom firmware to the Shelly. 

I was already using ESPHome for my light switches (also Shelly's) and thought I would do the same here. (I won't go over how to flash the Shelly as there are many tutorials available)

Why do I like ESPHome so much?

* It's open-source
* You can configure your devices with YAML and track changes with git (I store mine with my Home Assistant configuration)
* There is a great ESPHome add-on for Home Assistant that allows you to upload changes directly to the devices.
* It integrates seamlessly with Home Assistant. No need for MQTT (sorry, Tasmota).
* You can write small automations that run autonomously on the device itself.

Time for some YAML configuration then! There are three main things we have to configure:

* The relay inside the Shelly 1 so we can turn it on/off to actuate the garage door.
* The contact sensor attached to the `SW` input of the Shelly. We'll use this to determine the state of the garage door.
* The "cover" that will be exposed to Home Assistant. This is your garage door!

**Note**: This isn't a comprehensive getting started guide. If you're unfamiliar with ESPHome or have trouble following these steps, check out the [Get Started section of their documentation](https://esphome.io/guides/getting_started_hassio.html).

Let's start with the relay inside the Shelly. We have to create a `switch` and tell ESPHome to which GPIO pin the relay is attached. I marked it as `internal` because I don't need the state of the relay in Home Assistant:

```yaml
switch:
  - platform: gpio
    pin: GPIO4
    name: "Garage Door Relay"
    id: relay
    internal: true
```

Next up: the contact sensor. For this, I use a `binary_sensor` that looks at Shelly's `SW` input (attached to GPIO5).  Once again, this is an `internal` component.

I added the `invert` filter because my contact sensor returns false when the garage is open, and I think that somewhat counterintuitive. But this isn't required, just keep it in mind for the next steps ;)

```yaml
binary_sensor:
  - platform: gpio
    pin: GPIO5
    name: "Garage Door Contact Sensor"
    id: contact_sensor
    internal: true
    filters:
      - invert:
      # Debounce the contact sensor to prevent rapid on/off/on events
      - delayed_on_off: 500ms
```

With these two components, we can now make the `cover` component that will be exposed to Home Assistant.

To send the correct state of the door, we have to implement a simple `lambda` function. Mine returns `COVER_OPEN` when the contact sensor is `true` (remember that I inverted it) and otherwise it returns `COVER_CLOSED`. 

To actuate the garage door, I've defined `open_action` and `close_action` to briefly toggle the relay (0.5 seconds). That is what my garage door opener requires to open or close. A `stop_action` was not implemented because my opener has a built-in safety system.

```yaml
cover:
  - platform: template
    device_class: garage
    name: "Garage Door"
    id: template_cov
    lambda: |-
      if (id(contact_sensor).state) {
        return COVER_OPEN;
      } else {
        return COVER_CLOSED;
      }
    open_action:
      - switch.turn_on: relay
      - delay: 0.5s
      - switch.turn_off: relay
    close_action:
      - switch.turn_on: relay
      - delay: 0.5s
      - switch.turn_off: relay
```

Here is the full ESPHome configuration for my garage, including stuff like board type, WiFi configuration, Home Assistant API, ...

```yaml
substitutions:
  friendly_name: Garage

esphome:
  name: garage
  platform: ESP8266
  board: esp01_1m

# The door contact sensor that is attached to SW on the 
# Shelly 1. Not exposed to HA, instead used to set the 
# state of the cover.
binary_sensor:
  - platform: gpio
    pin: GPIO5
    name: "Garage Door Contact Sensor"
    id: contact_sensor
    internal: true
    filters:
      - invert:
      # Debounce the contact sensor to prevent rapid on/off/on events
      - delayed_on_off: 500ms

# The relay in the Shelly 1 that will deliver the pulse to
# the garage door opener (not exposed to HA)
switch:
  - platform: gpio
    pin: GPIO4
    name: "Garage Door Relay"
    id: relay
    internal: true

# This creates the actual garage door in HA. The state is based
# on the contact sensor. Opening/closing the garage door simply
# turns the relay on/off with a 0.5s delay in between.
cover:
  - platform: template
    device_class: garage
    name: "Garage Door"
    id: template_cov
    lambda: |-
      if (id(contact_sensor).state) {
        return COVER_OPEN;
      } else {
        return COVER_CLOSED;
      }
    open_action:
      - switch.turn_on: relay
      - delay: 0.5s
      - switch.turn_off: relay
    close_action:
      - switch.turn_on: relay
      - delay: 0.5s
      - switch.turn_off: relay


wifi:
  ssid: !secret wifi_iot_ssid
  password: !secret wifi_iot_password

  # Enable fallback hotspot (captive portal) in case wifi connection fails
  ap:
    ssid: $friendly_name Fallback Hotspot
    password: !secret esphome_fallback_ap_password

captive_portal:

# Enable logging
logger:

# Enable Home Assistant API
api:
  password: !secret esphome_api_password

ota:
  password: !secret esphome_api_password

# Send IP Address to HA
text_sensor:
  - platform: wifi_info
    ip_address:
      name: $friendly_name IP Address

# Send WiFi signal strength & uptime to HA
sensor:
  - platform: wifi_signal
    name: $friendly_name WiFi Strength
    update_interval: 60s
  - platform: uptime
    name: $friendly_name "Uptime"
```

## Installing neatly
Time to install everything properly. To secure the cable of the door contact sensor, I 3D printed some zip tie anchors. Thanks, [LoboCNC for putting your design on Thingiverse](https://www.thingiverse.com/thing:1800896)! 

![3D Printed zip-tie anchors for cable management](/uploads/2020-06-smart-garage-door-shelly-home-assistant/3d-printed-zip-tie-anchors.jpg)
*3D Printed zip-tie anchors for cable management*

I glued these on top of the garage door's aluminum frame and then zip-tied the sensor cable to them:

![Securing the sensor's cable](/uploads/2020-06-smart-garage-door-shelly-home-assistant/cable-routing.jpg)
*Securing the sensor's cable (don't want it jamming up my garage door)*

You can see that the cable enters the top of the garage door opener (that opening was already there for other peripherals). I then took off the bottom lid and attached the Shelly 1 with adhesive tape:

![Shelly 1 inside my garage door opener](/uploads/2020-06-smart-garage-door-shelly-home-assistant/shelly-inside-garage-door-opener-1.jpg)
*Shelly 1 inside my garage door opener. Attached with adhesive tape.*

The Shelly is connected to the garage door opener's logic board to toggle the state (and also received 24V of power from it):

![Shelly connected to the logic board of the garage door opener](/uploads/2020-06-smart-garage-door-shelly-home-assistant/shelly-inside-garage-door-opener-2.jpg)
*Shelly connected to the logic board of the garage door opener*

Putting the lid back on, and everything is hidden from view. Nice and clean:

![From the outside everything is still the same. Looks like a "dumb" garage door opener.](/uploads/2020-06-smart-garage-door-shelly-home-assistant/shelly-inside-garage-door-opener-3.jpg)
*From the outside everything is still the same. Looks like a "dumb" garage door opener.*

## Home Assistant
With the ESPHome setup finished, it's time to integrate everything into Home Assistant. 

Luckily, ESPHome devices are automatically discovered, so no need for manual setup. Cool!

![ESPHome devices are automatically discovered by Home Assistant](/uploads/2020-06-smart-garage-door-shelly-home-assistant/esphome-discovered-home-assistant.png)
*ESPHome devices are automatically discovered by Home Assistant*

The `cover` we configured in ESPHome is automatically exposed to Home Assistant as well. Here is my Garage Door in Lovelace:

![Garage Door controls in Home Assistant](/uploads/2020-06-smart-garage-door-shelly-home-assistant/garage-door-controls-home-assistant.png)
*Garage Door controls in Home Assistant*

Because of the contact sensor, Home Assistant knows exactly if the garage door is opened or closed, and the arrows reflect that. Garage closed? Up arrow is enabled. Garage open? Down arrow is enabled.

My default ESPHome configuration also sends additional data to Home Assistant: the uptime of the Shelly, its IP address, and WiFi signal strength. I don't use these often, but they can help diagnose problems when they arise (is the WiFi connection bad / does the Shelly often restart / etc..)

![Additional entities that could help spot/debug problems](/uploads/2020-06-smart-garage-door-shelly-home-assistant/home-assistant-other-garage-entities.png)
*Additional entities that could help spot/debug problems*

### Automation examples
Once these entities are in Home Assistant, you can start automating! 

We always keep our garage door closed but occasionally forget it. So the first automation I made is one that alerts us when the garage was left open longer than 5 minutes:

```yaml
- id: b8aa033f-800f-4d26-8f99-f533d705421f
  alias: "[📣] Notify when garage door was left open for too long"
  trigger:
    platform: state
    entity_id: cover.garage_door
    to: open
    for:
      minutes: 5
  action:
  - service: notify.notify
    data:
      title: "🚙 Garage left open!"
      message: "Garage door has been open for 5 minutes. Close it?"
```

### Actionable notifications
As said in the beginning: I don't want to carry the garage's remote control anymore. So I created an automation that sends me an actionable notification whenever I arrive home on weekdays. Tap it, and the garage opens without having to go into Home Assistant.

You can read more about how to setup actionable notifications on the Home Assistant Companion Apps website: [https://companion.home-assistant.io/docs/notifications/actionable-notifications](https://companion.home-assistant.io/docs/notifications/actionable-notifications)

Here's the automation that send the actionable notification:
```yaml
- id: 082bf626-021e-4e05-8a9e-c36a94486bc5
  alias: "[📣] Send notification to Xavier to open garage door on weekdays"
  trigger:
  - platform: state
    entity_id: person.xavier_decuyper
    from: not_home
    to: home
  condition:
    condition: time
    weekday:
      - mon
      - tue
      - wed
      - thu
      - fri
  action:
  - service: notify.mobile_app_iphone_van_xavier
    data:
      title: "🏡 🔑 Welcome home Xavier!"
      message: "Want to open the garage?"
      data:
        push:
          category: garage_open
```

Note the extra data I send and the `garage_open` category. 

In my `configuration.yaml` file I then created a category for this actionable notification (`garage_open` with the identifier `GARAGE_OPEN`). 

I've also set `authenticationRequired` to true, so FaceID/TouchID is required before being able to open the garage. Better be safe!

```yaml
ios:
  push:
    categories:
      - name: Garage open
        identifier: 'garage_open'
        actions:
          - identifier: 'GARAGE_OPEN'
            title: 'Open garage'
            activationMode: 'background'
            authenticationRequired: true # Require FaceID / TouchID
            destructive: false
            behavior: 'default'
```

When the user clicks on "Open garage" an event is created in Home Assistant. This is then used by another automation to open the garage and close it after about a minute. This gives me ample of time to park my bike and make my way to the house:

```yaml
- id: 6c18050e-dad5-455f-bd52-4a1d5ad50cbd
  alias: '[📣📲] Callback notification to open garage'
  trigger:
    platform: event
    event_type: ios.notification_action_fired
    event_data:
      actionName: GARAGE_OPEN
  action:
    - service: cover.open_cover
      data: {}
      entity_id: cover.garage_door
    - delay: 00:01:00
    - service: cover.close_cover
      data: {}
      entity_id: cover.garage_door
```

This is what it looks like on my phone:

![Actionable notification on iOS](/uploads/2020-06-smart-garage-door-shelly-home-assistant/actionable-notification.png)
*Actionable notification on iOS*

### Automating lights

Here's another conventient automation: when the garage door opens (and it's dark outside), turn on the lights. Then, 30 seconds after the garage was closed, turn them off again.

Both these actions are automated with a single automation:

```yaml
- id: 79d7fa44-a2bc-4856-ba6d-f42a58fe6080
  alias: '[💡] Garage light on when gate opens/closes'
  trigger:
    - platform: state
      entity_id: cover.garage_door
      from: closed
      to: open
      for:
        seconds: 2
    - platform: state
      entity_id: cover.garage_door
      from: open
      to: closed
      for:
        seconds: 30 # Turn off, when garage is closed for 30 seconds
  condition:
    - condition: state
      entity_id: sun.sun
      state: below_horizon
  action:
    - service_template: >-
        {% raw %}{% if trigger.to_state.state == "open" %}light.turn_on{% endif %}
        {% if trigger.to_state.state == "closed" %}light.turn_off{% endif %}{% endraw %}
      entity_id: light.garage
      data: {}
```

It's things like this that make me appreciate Home Assistant. No more walking to the light switch in the dark ;)

## Conclusion & next steps
I'm super happy with how this turned out. Our "smart" garage door has been very reliable, so much so that I don't even bother carrying the remote! It also gives me peace of mind being able to check the state of the garage easily and knowing that it's tied into the security system.

As a next step, I would like to automatically open the garage when we drive up to it (as opposed to the notification). I'm thinking about using a Bluetooth beacon in the car. Any thoughts?

Happy home hacking!
