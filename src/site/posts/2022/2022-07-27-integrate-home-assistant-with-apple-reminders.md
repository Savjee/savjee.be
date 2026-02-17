---
layout: post
title: "Integrate Home Assistant with Apple Reminders"
description: "A clever workaround to sync Home Assistant with Apple Reminders, allowing your home automations to create tasks on your iPhone and Mac."
tags: [Home Assistant]
upload_directory: /uploads/2022-07-integrate-home-assistant-with-apple-reminders/
thumbnail: /uploads/2022-07-integrate-home-assistant-with-apple-reminders/thumb_timeline.jpg
toc_enabled: true
---

I recently integrated Home Assistant with Apple Reminders so that automations can create new todos. This is trickier as it sounds, because Reminders has no API that can be accessed from Home Assistant. Here's how I worked around that problem with a script, input text helper and an iOS Shortcut.

<!--more-->

## Why?
First up: why do I want my home automation system creating todos for me? The [point of home automation is to free up time, and take tasks out of my hands]({% link collections.posts, "2021-04-10-good-home-automation-should-be-boring.md" %}), not to create them!

Unfortunately, certain devices just require manual maintenance. A robot vacuum cleaner and dehumidifier are perfect examples of this. When their tanks are full, they need to be emptied. And since Home Assistant already knows the state of these devices, it might as well create a todo for me.

I used to send myself notifications for these chores, but notifications aren't meant to be used as a todo list. They can be dismissed accidentally, and they get lost in the endless stream of notifications during a day. Instead, tasks belong in a todo app.

## Overview
Here's a high-level overview of how I integrated Reminders with Home Assistant:

![](/uploads/2022-07-integrate-home-assistant-with-apple-reminders/home-assistant-apple-reminders-integration.svg)

## Home Assistant
I started by creating an [input text helper](https://www.home-assistant.io/integrations/input_text/) in Home Assistant. This will temporarily store all todos until they're processed by Shortcuts.

```yaml
input_text:
  xtodo_todos:
    name: Pending todos
    initial: ""
    max: 255  # No way to increase this, so make sure that iOS syncs frequently
```

An input text helper has one drawback: it can only store up to 255 characters. But this should be sufficient, given that todos are very short and that the helper is cleared whenever todos have been processed.

Next, I created a script that can append items to this input text helper. It basically takes the existing value of the helper and adds a line break followed by your todo:

{% highlight yaml %}
script:
  xtodo_create_todo:
    alias: Create new TODO
    sequence:
      - if:
          condition: template
          value_template: "{{todo is not defined}}"
        then:
          - stop: "No \"todo\" variable defined."
            error: true
      - service: input_text.set_value
        entity_id: input_text.xtodo_todos
        data:
          value: >-
            {%- if states('input_text.xtodo_todos') |length != 0 -%}
            {{states('input_text.xtodo_todos')}}\n
            {%- endif -%}
            {{ todo }}
{% endhighlight %}

It's a very simple script, but it centralizes the logic in one place. It can now be used in any automation you want. 

For instance, I have an automation that is triggered when the dehumidifier's tank is full. Instead of sending me a push notification, it now creates a new todo:

```yaml
- alias: '[☑️] Create todo when dehumidifier tank is full'
  trigger:
    - platform: state
      entity_id: binary_sensor.dehumidifier_tank_full
      from: "off"
      to: "on"
  action:
    # Add a new todo!
    - service: script.turn_on
      entity_id: script.xtodo_create_todo
      data:
        variables:
          todo: "Empty dehumdifier tank"
```

When you created multiple todos, the state of the input text helper will look like this:

```
Empty dehumidifier tank
Put trash out: Paper, PMD
```

## Shortcut
To bring these todos into Reminders, I'm using the Shortcuts app on iOS. Here's what it does:

* Grab the state of `input_text.xtodo_todos`
* Split the text by new lines
* Loop over each line and add it to Reminders with a due date of today
* Set the state of `input_text.xtodo_todos` to an empty string

And this is what it looks like when you translate it into "code":

![](/uploads/2022-07-integrate-home-assistant-with-apple-reminders/home_assistant_apple_reminders_shortcut_integration.png)

All that’s left now is making sure that this shortcut runs regularly, so it transfers todos from Home Assistant into Reminders. I’ve created 3 automations for that in the Shortcuts app:

![](/uploads/2022-07-integrate-home-assistant-with-apple-reminders/shortcuts-schedule.png)

Three times a day, Shortcuts will run my workflow and fetch todos from Home Assistant. I wish Apple would allow you to set multiple triggers for an automation though.

![](/uploads/2022-07-integrate-home-assistant-with-apple-reminders/shortcuts-schedule2.png)

And that's it! All done!


## Home Assistant Package + Shortcut download
Want to use this system yourself? Here's a package](https://www.home-assistant.io/docs/configuration/packages/) you can use in your Home Assistant config:

{% highlight yaml %}
packages:
  xtodo:
    input_text:
      xtodo_todos:
        name: Pending todos
        initial: ""
        max: 255  # No way to increase this, so make sure that iOS syncs frequently

    script:
      xtodo_create_todo:
        alias: Create new TODO
        sequence:
          - if:
              condition: template
              value_template: "{{todo is not defined}}"
            then:
              - stop: "No \"todo\" variable defined."
                error: true
          - service: input_text.set_value
            entity_id: input_text.xtodo_todos
            data:
              value: >-
                {%- if states('input_text.xtodo_todos') |length != 0 -%}
                {{states('input_text.xtodo_todos')}}\n
                {%- endif -%}
                {{ todo }}
{% endhighlight %}


And here's a link to the iOS Shortcut: [https://www.icloud.com/shortcuts/f31e9022a6d247e8869e0be9b4d8e1e4](https://www.icloud.com/shortcuts/f31e9022a6d247e8869e0be9b4d8e1e4)


## Conclusion
I've been using this setup for a few months and it has been working great. However, I still try to automate whatever can be automated and keep the amount of todos to a minimum. My smart home should work for me, not boss me around ;)
