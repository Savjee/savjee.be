---
layout: post
title: "I Built a CO2 Sensor and It Terrifies Me"
quote: 
tags: [Home Assistant, ESPHome]
upload_directory: /uploads/2021-10-03-i-built-a-co2-sensor-and-it-terrifies-me/
thumbnail: /uploads/2021-10-03-i-built-a-co2-sensor-and-it-terrifies-me/humb_timeline.jpg
toc_enabled: true
---

Governments are pushing CO2 sensors to fight the COVID-19 pandemic, but proper ventilation is equally important for our health and even our cognitive performance. 

In this blog post we'll look at a DIY CO2 sensor: how it runs ESPHome, how it integrates with Home Assistant, how it works and what safe CO2 levels are.

<!--more-->

There are many commercially available indoor CO2 sensors you can buy. They are inexpensive, but sadly, they're very dumb. I want a sensor that can communicate with Home Assistant so I can track CO2 levels over time and generate warnings when levels are getting too high.

## The kit
I started my search for a CO2 sensor on AliExpress, but then I came across [a tweet from a science communicator in Belgium](https://twitter.com/lievenscheire/status/1435129962386890753) about a local company selling a kit called [Control CO2](https://controlco2.space). It includes a custom-designed PCB, an ESP32 microcontroller, and a CO2 sensor for only €56,59 (including shipping).


**Specs:**

* Custom PCB
* CO2 sensor: MH-Z19
* Microcontroller: LilyGO TTGO T-Display (ESP32 with built-in TFT display)
* Optional temperature & humidity sensor: DHT22

Sure, buying all these components on AliExpress would be a lot cheaper, ~~but I wanted to buy from a local business~~. Okay, not really. I wanted instant gratification and ordering from a local company meant I only had to wait a day (versus a few weeks with AliExpress).

![](/uploads/2021-10-03-i-built-a-co2-sensor-and-it-terrifies-me/controlco2-space-sensor-kit-1.jpg)

The DIY part of this kit is basic: solder the female pin header to the PCB and then plug in the CO2 sensor and microcontroller. Done!

## Stock firmware
Next, I powered up the board with a USB-C cable, and the sensor started measuring the CO2 levels straight away!

![](/uploads/2021-10-03-i-built-a-co2-sensor-and-it-terrifies-me/controlco2-space-sensor-kit-2.jpg)

Not long after, it went into alarm mode. The display started flashing red, indicating that CO2 levels were too high. I was about to freak out and open all the windows, but then I realized the sensor was directly under my nose, so I was breathing all my waste CO2 straight into it. Cool! This thing seems to work!

![](/uploads/2021-10-03-i-built-a-co2-sensor-and-it-terrifies-me/controlco2-space-sensor-kit-3.gif)

## 3D printed case
This wouldn't be a DIY project without some 3D printing. I was going to design one myself, but the creators of the kit already did that. No point in reinventing the wheel, so I downloaded [their STL files](https://github.com/controlco2/3D-print), sent it to my printer and an hour later, I had a nice cloud-shaped case with two buttons on the front:

![](/uploads/2021-10-03-i-built-a-co2-sensor-and-it-terrifies-me/controlco2-space-sensor-kit-4.jpg)

The case fits together with two M3 screws at the back of the unit. Neat!

![](/uploads/2021-10-03-i-built-a-co2-sensor-and-it-terrifies-me/controlco2-space-sensor-kit-5.jpg)

So the sensor is up and running. End of the blog post, right?

Not so fast...

## Flashing ESPHome
If you've read some of my previous posts, you know that I'm a huge fan of Home Assistant and ESPHome. I like the idea of having full control over a device's firmware and prevent a manufacturer from phoning home (not that this sensor does that). And since this kit is based on an ESP32, I can flash ESPHome onto it!

I started with my basic ESPHome configuration, which sets up the WiFi, over-the-air-updates, and the API for Home Assistant. 

```yaml
esphome:
  name: "air-quality-indoor"
  platform: ESP32
  board: "featheresp32"

wifi:
  ssid: "Your WiFi SSID"
  password: "Your WiFi password"

logger:

# To connect with Home Assistant
api:
  password: "API PASSWORD"

# To flash updates over-the-air
ota:
  password: "OTA PASSWORD"
```

I re-use this part across all my devices. [Here's how I structure my ESPHome config files for re-usability]({% link collections.posts, "2021-05-27-how-i-structure-my-esphome-config-files.md" %}).

Next, I configured the CO2 sensor itself (which uses a UART bus):

```yaml
uart:
  rx_pin: 27
  tx_pin: 26
  baud_rate: 9600

sensor:
  - platform: mhz19
    update_interval: 60s
    automatic_baseline_calibration: false
    co2:
      name: "CO2 Indoor"
      id: "co2_sensor"
    temperature:
      name: "Temperature"
```

At this point, I had a working configuration file that would report CO2 levels to Home Assistant. But the microcontroller also has a built-in display. Can ESPHome drive that? Absolutely!

Not only does it support the st7789v display driver, it also supports showing multiple "pages" on the display and cycling through them. I only wanted to show the current CO2 levels on the display, but since it has this feature, I figured I might as well add a second page with network information:

```yaml
text_sensor:
  - platform: wifi_info
    ip_address:
      internal: true
      id: wifi_ip_addr
    ssid:
      internal: true
      id: wifi_ssid

font:
  - file: "Oswald-Light.ttf"
    id: font_70
    size: 70
    glyphs: 0123456789 # Only used for CO2 level

  - file: "Oswald-Light.ttf"
    id: font_30
    size: 30

color:
  - id: color_black
    red: 0%
    green: 0%
    blue: 0%
    white: 0%
  - id: color_green
    red: 0%
    green: 100%
    blue: 0%
  - id: color_yellow
    red: 100%
    green: 100%
    blue: 0%
  - id: color_orange
    red: 100%
    green: 55%
    blue: 0%
  - id: color_red
    red: 100%
    green: 0%
  - id: color_white
    red: 100%
    green: 100%
    blue: 100%

display:
  - platform: st7789v
    id: my_display
    model: "TTGO TDisplay 135x240"
    backlight_pin: GPIO4
    cs_pin: GPIO5
    dc_pin: GPIO16
    reset_pin: GPIO23
    rotation: 90
    pages:
      # Page 1: Current CO2 levels
      #    0    - 1000 -> Green
      #    1000 - 1600 -> Yellow
      #    1600 - 2000 -> Orange
      #    >2000       -> Red
      - id: page1
        lambda: |-
          if(!id(co2_sensor).has_state() ){
            it.print(
              it.get_width()/2,
              it.get_height()/2,
              id(font_70),
              color_white,
              TextAlign::CENTER,
              "Starting..."
            );
            return;
          }
         
          auto bg_color = id(color_black);
          auto text_color = id(color_green);
          auto co2 = id(co2_sensor).state;

          if(co2 > 1000) text_color = id(color_yellow);
          if(co2 > 1600) text_color = id(color_orange);
          if(co2 > 2000){
            text_color = id(color_white);
            bg_color = id(color_red);
          }

          it.filled_rectangle(0, 0, it.get_width(), it.get_height(), bg_color);
          it.printf(
            it.get_width()/2, 
            it.get_height()/2, 
            id(font_70), 
            text_color, 
            TextAlign::CENTER, 
            "%.0f",
            co2
          );

      # Page 2: WiFi information
      - id: page2
        lambda: |-
          it.print(
            0, 0,
            id(font_30),
            id(color_white),
            "WiFi details"
          );

          it.printf(
            0, 30,
            id(font_30),
            id(color_white),
            "%s",
            id(wifi_ssid).state.c_str()
          );

          it.printf(
            0, 60,
            id(font_30),
            id(color_white),
            "%s",
            id(wifi_ip_addr).state.c_str()
          );
```

One last thing: remember that the case has two physical buttons on the front. I want the top button to cycle between pages (CO2 level and network information), and the bottom button to toggle the display's backlight (in case I want to use it in "stealth" mode):

```yaml
binary_sensor:
  # Button to cycle through pages on the display
  - platform: gpio
    pin:
      number: GPIO35
      inverted: true
    id: button_1
    on_click:
      then:
        - display.page.show_next: my_display
        - component.update: my_display

  # Button to toggle the backlight (for use at night)
  - platform: gpio
    pin:
      number: GPIO0
      inverted: true
    id: button_2
    on_click:
      then:
        - switch.toggle: backlight 
```

*Note: [the full ESPHome configuration file is available here](https://gist.github.com/Savjee/b38e7667f6d28503056ce2f840332946).*

I then used the [ESPHome CLI tool](https://esphome.io/guides/getting_started_command_line.html) to compile the firmware and flash it to the ESP32 via USB:

```
esphome run air-quality-indoor.yaml
```

Here's the first page in action showing the current CO2 levels while indicating severity. Green is "okay", yellow is "ventilate" and red means "danger".

![](/uploads/2021-10-03-i-built-a-co2-sensor-and-it-terrifies-me/controlco2-space-sensor-kit-6.jpg)

The second page shows the WiFi network name and the IP address of the sensor. I must admit that this isn't very useful, but I wanted to test this ESPHome feature...

![](/uploads/2021-10-03-i-built-a-co2-sensor-and-it-terrifies-me/controlco2-space-sensor-kit-7.jpg)

## Connecting to Home Assistant
Once flashed, I opened Home Assistant which had already discovered the sensor:

![](/uploads/2021-10-03-i-built-a-co2-sensor-and-it-terrifies-me/esphome-discovery-home-assistant.png)

All I had to do was click "configure", enter my API password, and the sensor began reporting CO2 levels and temperature to Home Assistant:

![](/uploads/2021-10-03-i-built-a-co2-sensor-and-it-terrifies-me/esphome-co2-entities.png)

_Note that the temperature sensor isn't very accurate, and I disabled it later on by marking it as "internal"._

## What are good CO2 levels?
With the data flowing into Home Assistant, I could track CO2 levels. But what are good CO2 levels?

Different countries have different interpretations, but it's important to note that the average amount of CO2 in the atmosphere is around 400ppm. So no matter how much you ventilate, you can't get below this level.

🇺🇸 In the US, [the CDC recommends](https://www.cdc.gov/niosh/topics/indoorenv/hvac.html) indoor CO2 levels should not be greater than 700ppm above the outdoor CO2 concentration. So that means a maximum indoor concentration of 1200ppm.

🇬🇧 In the UK there is [a recommendation for London's schools](https://www.london.gov.uk/sites/default/files/gla_iaq_report_with_nts.pdf) to keep the daily average CO2 concentration below 1000ppm, with higher concentrations (up to 1500ppm) allowed for 20 consecutive minutes.

🇧🇪 CO2 meters are also deployed to combat the COVID-19 pandemic. In Belgium, [the government requires cafes and restaurants to keep levels below 900ppm](https://www.ejustice.just.fgov.be/cgi_loi/change_lg_2.pl?language=nl&nm=2020010455&la=N). When levels exceed 1200ppm, the establishment has to be closed.

But wait, why do we use CO2 levels to fight a pandemic?

It turns out that CO2 levels are a good indicator of how well a room is ventilated, and a well-ventilated room reduces the risk of spreading viruses:

> Indoor CO2 levels, produced by metabolic breathing of the occupants, are a reliable indicator of ventilation rates, as increased outdoor airflow dilutes indoor concentrations. CO2 levels and corresponding ventilation rates are therefore a good indicator of pollutants with indoor sources (such as bio-effluents)...   
> - [Source: Indoor Air Quality in London's Schools](https://www.london.gov.uk/sites/default/files/gla_iaq_report_with_nts.pdf)  

## How bad is CO2?
But I digress... I don't have to fight a pandemic in my home. So what harm can CO2 do to my health?

Several studies [have found that CO2 levels above 1000ppm impact your decision-making](https://ehp.niehs.nih.gov/doi/10.1289/ehp.1104789?url_ver=Z39.88-2003&rfr_id=ori:rid:crossref.org&rfr_dat=cr_pub%20%200pubmed) and it gets worse when levels rise. Others found [high CO2 levels affect children's performance at school](https://www.mdpi.com/1996-1073/13/22/6099/pdf).

Many of these papers conclude that CO2 should be considered an air pollutant and that guidelines should be created to promote ventilation (even if that means higher heating costs). In Canada, [the government is working on a residential air quality guideline for CO2](https://www.canada.ca/en/health-canada/programs/consultation-residential-indoor-air-quality-guidelines-carbon-dioxide/document.html).

## Getting notified of high CO2 levels
Armed (and alarmed) with this information, I created an automation in Home Assistant to warn me about high levels of CO2. I send notifications at 1000ppm (ventilate soon) and again at 1600ppm (ventilate right now).

{% highlight yaml %}
- id: 35ACEE9B-DF8A-419D-9E3F-13E227E4060A
  alias: "[📣] Notify when CO2 levels are rising"
  mode: single
  trigger:
    - platform: numeric_state
      id: above-1000
      entity_id: sensor.co2_indoor
      above: '1000'
      for: &ref_0
        minutes: 30
    - platform: numeric_state
      id: above-1600
      entity_id: sensor.co2_indoor
      above: '1600'
      for: *ref_0
  condition:
    - condition: time
      after: '08:00:00'
      before: '22:00:00'
  action:
    - service: notify.xavier
      data:
        title: CO2 Alarm
        message: >-
          Current value: {{ trigger.to_state }}ppm
          {% if trigger.id == "above-1000" %}
            Ventilate soon.
          {% elif trigger.id == "above-1600" %}
            Ventilate the house now!
          {% endif %}
{% endhighlight %}

I then placed the sensor in the living room and let it do its thing for a few hours...

## Reviewing data: living room
The next day I reviewed the data... And I was in for a shock. Indoor CO2 is a BIG problem!

![](/uploads/2021-10-03-i-built-a-co2-sensor-and-it-terrifies-me/co2-levels-graph-living.png)

Our living room is next to the kitchen which has a window that we try to keep open throughout the day (if outdoor temperatures allow that).

While the window is open, CO2 levels stay below 500ppm, which is excellent. However, as soon as we closed the window at 8pm, CO2 levels started rising extremely quickly. In barely 2 hours it reached 1000ppm. Remember: at this level, your decision-making is impacted.

We went to bed a little after 10pm and you can see CO2 levels gradually decreasing as our home is not 100% air-tight. You can also see when we woke up (a bit after 6am) and straight away the air quality got worse until we finally opened a window around noon.

Next, I looked at the values while we had friends over. In theory, more people equal more CO2. And sure enough, the sensor data confirms that:

![](/uploads/2021-10-03-i-built-a-co2-sensor-and-it-terrifies-me/co2-levels-graph-friends.png)


## Reviewing data: bedroom
I was so shocked by these results that I immediately wanted to test the sensor in the bedroom. We always keep the window open there, so I assumed the air quality was going to be excellent. I put the sensor in the corner of our room (as far away from us as possible) and let it run overnight. 

The next morning the results surprised me:

![](/uploads/2021-10-03-i-built-a-co2-sensor-and-it-terrifies-me/co2-levels-graph-bedroom-1.png)

It turns out that an open window alone doesn't keep CO2 levels down. We went to bed at 22pm and within 2 hours, the CO2 levels rose to over 1000ppm.

But what are those big drops during the night? Aha! Those correspond to the moments when we fed our newborn son. We take him out of the room to change his diaper and then come back to feed him. While feeding, we keep the door open, which, in combination with the open window, is enough to ventilate the room and bring down CO2 levels.

![](/uploads/2021-10-03-i-built-a-co2-sensor-and-it-terrifies-me/co2-levels-graph-bedroom-2.png)

The data from the CO2 sensor is perfectly aligned with the data from the app that tracks his feeding times:

![](/uploads/2021-10-03-i-built-a-co2-sensor-and-it-terrifies-me/baby-feeding-times.png)

Conclusion: an open window alone isn't enough to keep CO2 levels down. You need to make sure that air can flow around your house (by opening a window on the other side, for instance).

## How the sensor works
Before ending this post, I want to explain how the sensor works and how accurate it is.

The MH-Z19 is a non-dispersive infrared sensor (NDIR). Inside are two components: on one side you have an LED that emits light at a specific wavelength and on the other side a sensor that measures the brightness of that light. CO2 in the air will absorb some of this light, so there's a reduction in light that reaches the other side. 

![](/uploads/2021-10-03-i-built-a-co2-sensor-and-it-terrifies-me/co2-sensor-workings.svg)

This type of sensor is cheap, relatively accurate, and has a long lifespan. However, it gets less accurate as it gets older because the LED inside will deteriorate and put out less light. This causes the sensor to report higher than actual CO2 levels (because it believes more light is being absorbed by the CO2).

Luckily, you can calibrate the sensor to compensate for this. Place the sensor in "clean" outdoor air and see how far off the 400ppm mark it is. ESPHome has built-in calibration that does exactly this: `automatic_baseline_calibration`.

## Conclusions
Here are my two conclusions about this fun and quick project:

* We should pay more attention to CO2 levels indoor and the effect it has on our health.
* Is there anything that ESPHome can't do? This is the best open-source firmware EVER!

The [full ESPHome configuration is available on GitHub](https://gist.github.com/Savjee/b38e7667f6d28503056ce2f840332946). 
