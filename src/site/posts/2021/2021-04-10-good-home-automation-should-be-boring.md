---
layout: post
title: "Good Home Automation Should be Boring"
quote: 
tags: [Home Assistant, Smart Home, ESPHome, Shelly]
thumbnail: /uploads/2021-04-10-good-home-automation-should-be-boring/thumb_timeline.jpg
upload_directory: /uploads/2021-04-10-good-home-automation-should-be-boring
---

I'm a huge fan of Home Assistant to automate various things around the house. I often look at other people's setup for inspiration, and one thing struck me. Many people have cluttered dashboards and use Home Assistant to track just about any metric they can.

That's quite different from my setup. So, here's how I approach home automation.

<!-- more-->

_Disclaimer: this is my personal opinion. Everyone has different tastes, and Home Assistant can cater to all. Also, note that these concepts apply to other home automation software too._

## Home Automation: initial disappointment
When I started with Home Assistant, I felt like I gained a new superpower: controlling things from my phone.

Living room too dark? Take my phone, turn on the light.  
Garage door left open? Take my phone, check the status.  
Alarm turned on or not? Take my phone, check.  
Too cold? Take phone, turn on the heater.  

This is all very cool when you're just starting. But is this a "smart" home? It feels more like my phone is acting as a "smart" replacement for light switches, RF remotes, and thermostats.

There's little added benefit. Sure, you can control things from anywhere (or without getting off the couch), but it still requires your involvement. You're the one managing everything, making decisions left and right.

## Automate what can be automated
Instead, I automate as many things as possible.


Turn on the living room lights, and close the curtains when the sun goes down.  
Close the garage door when it's left open too long.  
Turn on the alarm when nobody is home. Turn it off when we get home.  
Turn on the heat when we're home. Turn it off when we leave.  


```yaml
- id: 71c07d1680a946e19290e0bb25f60a6e
  alias: '[💡] Turn on TV light when at home and sun is about to set'
  condition:
    # Only turn on lights when we're home.
    - condition: state
      entity_id: group.residents
      state: home
  trigger:
    - platform: sun
      event: sunset
      offset: -00:20:00
  action:
    - service: light.turn_on
      entity_id: light.tv_light
```

Now we're getting somewhere. Each of these automations takes away a decision. I don't have to think about turning on lights or closing the curtains at night.

Fun story: my home automation journey started when a co-worker introduced me to Home Assistant. He told me that he couldn't remember which switch controls which light because they're automated. I thought he was crazy. No way that you forget how to turn on the lights in your home. Fast-forward a couple of months, and I must admit that he was right.

## My Lovelace Dashboard
Automations put your house on auto-pilot, and by extension, they remove the need for a Lovelace dashboard filled with buttons and switches.

This leaves room for what really matters. Here's what my dashboard looks like:

![Screenshot of my Home Assistant dashboard](/uploads/2021-04-10-good-home-automation-should-be-boring/my-home-assistant-dashboard.png)

It's a bit minimalistic. The goal of my dashboard is to draw attention to things that are important right now. Everything you see in the screenshot is a conditional card. It only appears when needed.


Was the garage door left open? A card will appear to draw my attention to it. Was it closed? The card disappears.  
Are there no water leaks in the house? Awesome! Don't bother me with the status of the sensors.  


Nowadays, I mainly use the Home Assistant app for peace of mind—a quick check to make sure that everything is in order.

In case you're wondering: these cards use [Button Text Card](https://github.com/Savjee/button-text-card) (which I developed). But you can make any card conditional with Home Assistant's built-in [conditional card](https://www.home-assistant.io/lovelace/conditional/).

Here's my conditional garage door card. It hides when the state is `closed`.

```yaml
type: 'custom:button-text-card'
entity: cover.garage_door
hide_condition: |
  [[[
    return entity.state === "closed"
  ]]]
icon: "mdi:garage-open-variant"
title: "Garage door"
subtitle: "Left open!"
```

Of course, I still have tabs that allow me to take manual control. But I hardly ever use them.

## Ignore the irrelevant
Home Assistant is a fantastic tool. Not only can it automate your home, but it can also keep track of all sorts of stuff. COVID19 infections, YouTube subscribers, memory usage on your devices, server uptime, etc.

But should you?

Personally, I only integrate services with Home Assistant if I can use them for automations. I could keep track of [my YouTube subscriber count](https://www.youtube.com/channel/UCnxrdFPXJMeHru_b4Q_vTPQ), but what purpose would that serve?

I prefer to keep my Home Assistant instance simple and only integrate services for which I have a use case.

## But what if it all goes wrong?
When I show my automation setup to friends and family, they almost always ask: "What if it stops working? You'll be sitting in the dark."

I've been using Home Assistant for the past 18 months, and such a situation hasn't occurred yet.

I put that down to three things: 

* I have backups
* I'm very picky about the hardware I buy
* I keep the legacy infrastructure intact

**Backups** are probably the most uncool topic of any home automation setup. But it's a good line of defense for when you (eventually) screw up. Every night, Home Assistant [makes a backup to Google Drive](https://github.com/sabeechen/hassio-google-drive-backup), and every other day, Proxmox backs up the entire Home Assistant VM to my NAS. A rollback is quick and easy.

I also pick **reliable hardware**. I have Ubiquiti access points all over the house for good WiFi coverage. I don't buy devices that rely on a cloud service and instead use [ESPHome](https://esphome.io) to get local control. Some devices, like Shelly smart switches, allow you to overwrite the stock firmware with something else. I have quite a few of those around the house running ESPHome, and they have been rock solid.

And finally, **I keep "legacy" infrastructure intact**. Every time I make a dumb device "smart," I keep the controls intact. I can still control my lights with the wall switches. My "smart" garage door can still be opened with its dumb RF remote. The thermostat can still be controlled through a unit on the wall.

Home Assistant and my automations are layered on top of these. So if things break, we'll manage as we did before. We'll get out of the couch, walk to the nearest switch, and turn on the light.

## Conclusion
Home automation is a wonderful journey. I hope that my approach and thoughts can inspire your smart home setup.

Share your thoughts in the comments or on Twitter: [@Savjee](https://twitter.com/Savjee).
