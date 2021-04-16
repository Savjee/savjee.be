---
layout: post
title: "Shelly 2.5 + ESPHome: potential fire hazard + fix"
quote:
tags: [ESPHome, Shelly]
thumbnail: /uploads/2020-11-09-shelly25-esphome-potential-fire-hazard-fix/thumb_timeline.jpg
upload_directory: /uploads/2020-11-09-shelly25-esphome-potential-fire-hazard-fix
---

If you have flashed your Shelly 2.5 with ESPHome, make sure to configure GPIO16. Otherwise, the pin will be short-circuited and cause the unit to heat up significantly, creating a potential fire hazard!

<!--more-->

> Thanks to [GuestGregor](http://disq.us/p/2d2izkj) for pointing this out. He commented on my blog post about [flashing ESPHome over-the-air to Shelly 2.5]({% link collections.posts, "2020-09-22-shelly-2.5-flash-esphome-over-the-air.md" %}).

I have two Shelly 2.5 units in my house, running ESPHome. I noticed that they run quite hot, usually floating around 62°C or 143°F. I thought this was due to its small form factor and installation location. 

Well, not true! It's a bad ESPHome config causing a short circuit, yikes!

## The fix
To fix this, configure GPIO16 as an input. You can do that by defining a `binary_sensor` in your ESPHome config:

```yaml
binary_sensor:
  - platform: gpio
    pin: GPIO16
    name: "ade7953 IRQ pin"
    internal: true
```

After deploying this to my Shelly 2.5 units, the internal temperature drops by 15°C (59°F). Crazy!

![Graph showing Shelly 2.5 overheating, then cooling down](/uploads/2020-11-09-shelly25-esphome-potential-fire-hazard-fix/shelly25-temperature-fix.png)
![Graph showing a second Shelly 2.5 overheating, then cooling down](/uploads/2020-11-09-shelly25-esphome-potential-fire-hazard-fix/shelly25-temperature-fix2.png)

## Explanation
So it's fixed now, but what was the problem?

According to [this GitHub issue](https://github.com/arendst/Tasmota/issues/7991) the problem is related to the ADE7953 energy monitoring chip. The IRQ pin of the chip is connected to GPIO16, and when it's left floating (not being configured as input or output), it acts as a load, creating additional heat (and potentially a shortened lifespan of the device).
