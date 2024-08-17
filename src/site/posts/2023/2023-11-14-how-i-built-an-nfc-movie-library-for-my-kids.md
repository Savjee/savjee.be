---
layout: post
title: "How I Built an NFC Movie Library for my Kids"
tags: ["Home Assistant", ESPHome, Plex, NFC, Parenting]
thumbnail: /uploads/2023-11-how-i-built-nfc-movie-library-for-my-kids/thumb_timeline.jpg
upload_directory: /uploads/2023-11-how-i-built-nfc-movie-library-for-my-kids/
date_updated: 2024-08-17
---

When I was a kid, my sister and I had a tower of VHS tapes we watched endlessly. Fast-forward to today, and my children's movie collection is vastly different. It's completely digital and dispersed across services. I wanted to recreate the tangible magic of my childhood for them.

<!--more-->

Here's our current media routine. We have two boys, and the eldest is permitted a 30-minute TV session in the morning and another in the evening. He usually knows what he wants to watch, but he depends on us to operate the remote and navigate to the correct apps.

This got me thinking: why not blend the old with the new? I wanted a way for my son to have a more active role in choosing what to watch, despite the digital format.

Years earlier, I came across someone who had prints of his favorite music albums with an NFC tag inside of them, and I made something similar for my kids.

## The end result
Here's what I ended up with:

![](/uploads/2023-11-how-i-built-nfc-movie-library-for-my-kids/final-result.jpg)

It's a collection of laminated movie covers with an NFC tag inside. All my son has to do is pick the movie he wants to watch and put it on the NFC reader. Home Assistant will do the rest.

Here's a video of the system working:

<video controls loop playsinline>
  <source src="/uploads/2023-11-how-i-built-nfc-movie-library-for-my-kids/nfc-demo.mp4" type="video/mp4">
</video>


## Proof-of-concept & materials
I started by building a simple prototype. One of my electronics kits contained an NFC Reader (RC522) and some NFC tags.

I connected the NFC reader to an ESP32 board and flashed ESPHome onto it. I then placed an NFC tag on top of the reader and saw them appearing in the ESPHome logs.

That's all the confirmation I needed. I went to AliExpress and bought the "production" hardware:

* [50x PVC NFC Cards (NTAG215)](https://nl.aliexpress.com/item/1005006068115788.html): €9.43
* [ESP32-C3 (Super Mini)](https://s.click.aliexpress.com/e/_DeNiv4J): €2.93

I already had plenty of ESP32 boards lying around (LOLIN32 lite), but when I saw this "Super Mini" version, I had to have it. Look at this cutie:

![](/uploads/2023-11-how-i-built-nfc-movie-library-for-my-kids/esp32c3-super-mini.jpg)


## Flashing ESPHome
Once everything arrived, I connected the NFC reader to the ESP32 using the following pins:

```
SS (SDA) -> GPIO7
SCK (SCK) -> GPIO4
MOSI -> GPIO6
MISO -> GPIO5
```

I also added a buzzer so I could beep some sounds when a tag was successfully scanned.

Next, I created an ESPHome configuration file. I had to add a few special `platformio_options` to make it work on the ESP32 "Super Mini" variant, but otherwise this is a very simple configuration.

```yaml
---
substitutions:
  devicename: "nfc-scanner"
  friendly_name: "NFC Scanner"

packages:
  esphome: !include common/esphome.yaml
  api: !include common/api.yaml
  logger: !include common/logger.yaml
  wifi: !include common/wifi.yaml

esphome:
  # Magic variables to get the ESP32C3 Super Mini to work
  platformio_options:
    board_build.f_flash: 40000000L
    board_build.flash_mode: dio
    board_build.flash_size: 4MB
  on_boot:
    priority: 600
    then:
      - rtttl.play: 'short:d=4,o=5,b=100:16e6,16e6'

esp32:
  variant: ESP32C3
  board: esp32-c3-devkitm-1
  framework:
    type: esp-idf

status_led:
  pin:
    number: GPIO8
    inverted: true

output:
  - platform: ledc
    pin: GPIO3
    id: buzzer

rtttl:
  output: buzzer

spi:
  clk_pin: GPIO4
  mosi_pin: GPIO6
  miso_pin: GPIO5

rc522_spi:
  cs_pin: GPIO7
  on_tag:
    then:
      - rtttl.stop:
      - homeassistant.tag_scanned: !lambda 'return x;'
      - rtttl.play: 'short:d=4,o=5,b=100:16e6,16e6'
```

If you're building this yourself, you don't have to adhere to these pin numbers.

<details>
  <summary><small><i>See my original ESPHome configuration for the LOLIN32 Lite here.</i></small></summary>

```yaml
---
substitutions:
  devicename: "nfc-scanner"
  friendly_name: "NFC Scanner"

packages:
  esphome: !include common/esphome.yaml
  api: !include common/api.yaml
  logger: !include common/logger.yaml
  wifi: !include common/wifi.yaml

esphome:
  platform: ESP32
  board: lolin32
  on_boot:
    priority: 600
    then:
      - rtttl.play: 'short:d=4,o=5,b=100:16e6,16e6'

output:
  - platform: ledc
    pin: GPIO32
    id: buzzer

rtttl:
  output: buzzer

spi:
  clk_pin: GPIO18
  mosi_pin: GPIO23
  miso_pin: GPIO19

rc522_spi:
  cs_pin: GPIO15
  on_tag:
    then:
      - rtttl.stop:
      - homeassistant.tag_scanned: !lambda 'return x;'
      - rtttl.play: 'short:d=4,o=5,b=100:16e6,16e6'
```

</details>

After flashing ESPHome, the device will show up in Home Assistant with no entities. No need to panic, that's normal. It will emit `tag_scanned` events. More on that later when we automate everything.

## 3D Printing an enclosure & collection box
To keep the electronics and wires safe from tiny hands, I designed and 3D printed a simple enclosure. 

![](/uploads/2023-11-how-i-built-nfc-movie-library-for-my-kids/nfc-reader-case-1.jpg)
*It's a box*

It's a simple design. The only challenge I had was fixing the ESP32 in place. Unlike other dev boards, the ESP32C3 Super Mini has no screw holes, so I designed a simple clip mechanism.

![](/uploads/2023-11-how-i-built-nfc-movie-library-for-my-kids/nfc-reader-case-2.jpg)
*Don't worry, the ESP32 is not floating in the air. It rests on the soldered GPIO pins on the bottom of the case.*

I used Fusion360 to design and test fit all the parts (thanks to Hans Wurst for publishing a [model of the Super Mini on GrabCAD](https://grabcad.com/library/esp32-c3-supermini-1)).

![](/uploads/2023-11-how-i-built-nfc-movie-library-for-my-kids/nfc-reader-case-3.jpg)
*By modeling every part, I can test if it all fits together well.*

I also made a nice box to store the NFC cards:

![](/uploads/2023-11-how-i-built-nfc-movie-library-for-my-kids/nfc-tags-case.jpg)


## Creating the "DVD" cards

With the reader finished, only the "DVD" cards were left. I wanted to print directly onto the PVC cards, but my printer isn't capable of that.

I went for the next best thing: I bought printable vinyl sticker paper and printed the movie covers on that.

![](/uploads/2023-11-how-i-built-nfc-movie-library-for-my-kids/nfc-pvc-cards-printing.jpg)

I then cut out the stickers and stuck them to the PVC cards.

![](/uploads/2023-11-how-i-built-nfc-movie-library-for-my-kids/nfc-pvc-cards-front.jpg)

I also designed a backside for the cards, which include a summary of the movie, release date, and the studio that worked on it.

![](/uploads/2023-11-how-i-built-nfc-movie-library-for-my-kids/nfc-pvc-cards-back.jpg)

<details>
  <summary><small><i>My first iteration of the cards were simply printed on paper and laminated.</i></small></summary>

With the reader finished, only the "DVD" cards were left. I printed small movie covers in booklet form, placed an NFC tag inside, and ran them through the laminator.

![](/uploads/2023-11-how-i-built-nfc-movie-library-for-my-kids/nfc-dvd-cards.jpg)
*The booklet protects the NFC tag and allows me to recover it in the future.*
</details>

## Home Assistant automation
On to the last piece of the puzzle: creating an automation in Home Assistant that plays the correct movie when a tag is scanned.

We store movies on Plex and played via an Apple TV. There are two ways to play a movie on Plex:
* Via the Apple TV integration, using [Plex deep links](https://forums.plex.tv/t/deep-links/205583)
* Via the [Plex integration](https://www.home-assistant.io/integrations/plex/)

The Plex integration is clunky and unreliable in my experience. It requires you to turn on the Apple TV, launch the Plex app, and wait for it to become available in Home Assistant before sending it a command to play a specific movie.

The Apple TV integration is near instant. All you have to do is send a "deep link", and that's it!

The deep link format is [documented on the Plex forum](https://forums.plex.tv/t/deep-links/205583), and is rather simple. Here's the deep link to play a given media item:

```
plex://play/?metadataKey=UNIQUE_MEDIA_ID&server=SERVER_ID
```

Your Plex server ID can be found by going to [this page](https://plex.tv/devices.xml) and looking for your server's `clientIdentifier`.

Next, I needed to know what kind of data ESPHome sends to Home Assistant when a tag is scanned. I opened the Developer Tools in Home Assistant and started listening for `tag_scanned` events. I put a tag on the reader and saw an event pop up:

```yaml
event_type: tag_scanned
data:
  tag_id: 1D-20-E2-06-96-00-00
  device_id: a93f971bb9622b266286460c3f2ac640
origin: LOCAL
time_fired: "2023-11-13T14:57:06.765528+00:00"
context:
  id: 01HF4JZB6DHY26TWZ903Z01BJ9
  parent_id: null
  user_id: null
```

The interesting bit here is the `tag_id`. I used this ID to create a mapping between the tag's ID and the ID of a movie in Plex.

Here's the entire automation:

{% highlight yaml %}
- alias: "NFC Reader - Plex"
  description: ""
  mode: single
  trigger:
  - platform: event
    event_type: tag_scanned

  # Only allow movies to be played in the morning and evening.
  # Broad time window to allow for some flexibility in schedule.
  condition:
  - condition: or
    conditions:
    - condition: time
      after: '05:00:00'
      before: '09:00:00'
    - condition: time
      after: '18:00:00'
      before: '19:50:00'  # Bed time!
  action:
  - variables:
	  # Map the ID of each tag to a Plex ID. The "name" attribute is
	  # not used but nice to have for debugging.
      NFC_MAPPING:
        53-77-08-69-71-00-01:
          name: Ratatouille
          plex_id: 37353
        53-72-08-69-71-00-01:
          name: Coco
          plex_id: 3135
        04-D3-F2-FD-9F-61-81:
          name: Bing
          playlist_id: 4586
        04-36-F6-32-5F-61-80:
          name: Bumba
          playlist_id: 4587
		# ...

  - if:
    # Make sure the scanned tag is in the mapping
    - alias: "NFC tag is in the mapping"
      condition: template
      value_template: "{{ trigger.event.data.tag_id in NFC_MAPPING }}"
    then:
    # Turn on the Apple TV (and the TV itself) when it's in standby
    - if:
      - condition: state
        entity_id: media_player.appletv_living
        state: standby
      then:
      - service: media_player.turn_on
        data: {}
        target:
          entity_id: media_player.appletv_living
      - delay:
          seconds: 5
	
    # If the matched tag has a "plex_id", play it as movie.
    - if:
        - condition: template
          value_template: "{{ \"plex_id\" in NFC_MAPPING[trigger.event.data.tag_id] }}"
      then:
        - action: media_player.play_media
          data:
            media_content_type: url
            media_content_id: >-
              plex://play/?metadataKey=%2Flibrary%2Fmetadata%2F{{NFC_MAPPING[trigger.event.data.tag_id].plex_id}}&server=xxxxxxxxxxxxxx
        target:
          entity_id: media_player.appletv_living
		  
    # If the matched tag has a "playlist_id", play a random item of it.
    - if:
        - condition: template
          value_template: "{{ \"playlist_id\" in NFC_MAPPING[trigger.event.data.tag_id] }}"
      then:
        - action: media_player.play_media
          data:
            media_content_type: url
            media_content_id: >-
              plex://play/?metadataKey=%2Fplaylists%2F{{NFC_MAPPING[trigger.event.data.tag_id].playlist_id}}&server=xxxxxxxxx
        target:
          entity_id: media_player.appletv_living

	# Set an appropriate (low) volume on our Sonos Beam
	# Volume controls on Apple TV only support up/down when using an eARC
	# speaker.
    - service: media_player.volume_set
	  data:
	    volume_level: 0.17
	  target:
	    entity_id: media_player.sonos_tv

{% endhighlight %}


The automation is simple and fast. It takes the Apple TV about 5 seconds to turn on the TV, launch the Plex app and have it play the correct movie.

![](/uploads/2023-11-how-i-built-nfc-movie-library-for-my-kids/system-diagram.png)

I was thrilled! And so was my oldest son. He quickly realized he could use this to watch movies *anytime* he wanted. That wasn't the goal, so I added a condition to only allow the automation to run in the mornings and evenings.

The Apple TV also supports deep links for other services. Here are examples for the biggest streaming services:

* Netflix (use the regular URL):
	* `https://www.netflix.com/title/80234304`
* Disney+ (use regular URL):
	* `https://www.disneyplus.com/movies/coco/db9orsI5O4gC`
* YouTube (use the regular URL with `https://` replaced by `youtube://`)
	* Single video: `youtube://www.youtube.com/watch?v=ah3ezprtgmc`
	* Playlist: `youtube://www.youtube.com/watch?v=v=FkUn86bH34M&list=PLzvRQMJ9HDiQF_5bEErheiAawrJ-2zQoI&pp=iAQB`

The only problem with these services is that they will require you to select a profile before the movie/show will start playing. With Plex, you can enable "auto login", but I haven't tried it for the other services.

## Playing random episodes
One issue I had with Plex deep links is that you can’t play a random episode of a TV show. I sidestepped this issue by not making any NFC cards for shows, but that was to the dismay of my sons.

A couple of months after I made this system, I came across [a post on the Plex forum](https://forums.plex.tv/t/tip-how-to-create-an-autoplaylist-with-random-sort/472823) explaining how you can make smart playlists that shuffle themselves every time you open them. And it even worked with the deep links!

The workaround is quite simple: start by making a “smart playlist” in Plex. Navigate to a library (movie or TV show) and change the first dropdown menu from “All” to “Advanced Filters”.

Now configure the filters. I created one smart playlist for each show (by matching the show name), but you can mix shows as well.

![](/uploads/2023-11-how-i-built-nfc-movie-library-for-my-kids/plex-smart-playlist.png)

Finally, set change the sort order from "Title" to "Randomly". Now Plex will shuffle the playlist every time you open it, including when you use a deep link!

You can find the playlist ID by navigating to the playlist in the Plex Web UI and then looking at the URL:
```
http://192.168.2.1:32400/web/index.html#!/server/{SERVER_ID}/playlist?key=%2Fplaylists%2F{PLAYLIST_ID}&context=source%3Acontent.playlists.video~0~0
```

For reference, the deep link for a playlist is slightly different to that of a movie:

```
plex://play/?metadataKey=%2Fplaylists%2F{PLAYLIST_ID_GOES_HERE}&server={SERVER_ID_GOES_HERE}
```


## Future improvements
I'm thrilled with my first iteration, but I have ~~some things~~ one thing I'd like to tweak in the future.

On the hardware side, I want to replace the NFC reader with the PN532. It's a lot smaller, and will allow me to make the enclosure smaller.

~~On the automation side, I want to make it possible for tags to play random episodes of TV shows. Right now, that's not possible with Plex deep links, so I'll use the Plex Integration as a workaround.~~

~~And finally, I found [printable NFC cards](https://www.amazon.de/-/nl/dp/B0C65TQJ7J/) on Amazon that look amazing. You can insert these in any inkjet printer and have really beautiful, and uniform cards.~~

## Why physical media is great
So why did I go through all this trouble to give my kids something tangible? Well, I see many advantages in a system like this.

First: you have a **limited choice** of movies to watch. When I was a kid, we didn't have an infinite catalog of movies to watch. We had a handful of VHS tapes and DVDs. We watched the same movies over and over again, each time discovering new details we would have missed otherwise.

Second, it **gives my kids autonomy**. They can decide what they want to watch and are not dependent on us to operate the remote and navigate to the correct app. They simply go to the box of cards, flip through them, pick a movie, and play it. Just like we used to do with VHS and DVD. 

Third, **with autonomy comes responsibility**. Between certain hours, we allow them to watch TV. They can watch any movie they like. They can even switch between movies. But the timeframe is fixed. They can watch a good chunk of one movie, or they can watch a tiny bit of 10 different movies. It's completely up to them. 

And finally, we have only one TV and two half-hour slots to watch it. This means they will need to **learn to collaborate and compromise**. They must quickly agree on a movie or forfeit their viewing time. Or perhaps they use their creativity to come up with a system to decide who gets to choose the movie. You can pick in the morning, I'll pick in the evening.

I have no evidence or research to back any of these claims. But I genuinely believe this could teach them valuable skills. And I feel it's way better than giving my kids unlimited access to Netflix, Disney+, YouTube, or any other streaming service.

## Do you hate streaming services?
It's not that I hate streaming services. I've had a Spotify subscription for years, and I occasionally subscribe to other streaming services. It's just that I don't watch that many movies or shows, so it's hard to justify the price.

Instead, I buy our favorite movies on Blu-ray and put them on our Plex server. This has 3 major benefits.

First, my son watches a few movies over and over again (especially Pixar movies). A Disney+ subscription costs €10,99/month, but for that price I can buy 3-4 Blu-rays on second hand websites. They're very cheap and once you buy a disc, it's yours forever.

Secondly, Blu-ray discs come with a lot of extra content. I especially love the "behind the scenes" or "deleted scenes" that most discs come with. These aren't always available on streaming services.

And finally, if you're a non-English speaker, Blu-rays will include a dubbed version in your native language. This is a big plus for the kids, especially when they're as young as mine are now.

## Conclusion & downloads
We're really happy with this system, and I'm looking forward to when my youngest will be able to use it as well.

Want to build your own? Here's [my Fusion360 design file](/uploads/2023-11-how-i-built-nfc-movie-library-for-my-kids/fusion-nfc-tag-reader-case.f3d) that you can use or improve upon.
