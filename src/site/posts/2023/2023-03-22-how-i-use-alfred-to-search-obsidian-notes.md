---
layout: post
title: "How I Use Alfred to Search My Obsidian Notes Faster (with Spotlight!)"
tags: [Obsidian, Alfred]
meta_tags: ["macOS", "alfred obsidian", "Spotlight", "Search engine", "Note taking", "Second brain"]
thumbnail: /uploads/2023-03-how-i-use-alfred-to-search-obsidian-notes/thumb_timeline.jpg
upload_directory: /uploads/2023-03-how-i-use-alfred-to-search-obsidian-notes/
---

In this post, I’ll show you how I integrated Obsidian into Alfred so I can search my vault from anywhere on my Mac. I just open Alfred, type “note” followed by my query, and see my search results. Hit enter and the correct note opens in Obsidian. Easy and quick!

<!--more-->

> Note: the instructions below require an [Alfred Powerpack](https://www.alfredapp.com/powerpack/).

<br>

Here's a screenshot of the Workflow in action:

![](/uploads/2023-03-how-i-use-alfred-to-search-obsidian-notes/alfred-search-obsidian-notes.png)

## Just text files
An Obsidian vault is a folder on your local hard drive with text files inside. You can search through it using any tool that can search files on disk.

My goal is simple: create an Alfred Workflow that allows me to search through my notes from anywhere.

The first question is: how can I search through my notes? I initially wanted to use grep, but that's inefficient as it doesn't build an index. Then I realized every Mac has a great search engine built-in: Spotlight!

## Spotlight's command-line interface
Much to my surprise, I found Spotlight has a command-line interface. You can search inside any folder by using the following command:

```
mdfind "search query" -onlyin /path/to/obsidian-vault
```

## Creating a Workflow in Alfred
Armed with this knowledge, I created a new workflow in Alfred. I added a script filter and configured it as follows:

![](/uploads/2023-03-how-i-use-alfred-to-search-obsidian-notes/alfred-workflow-obsidian-script-filter.png)

1. Set the keyword to “note” (or anything else you prefer).
2. Set argument to required. You need to enter a query before the script should run.
3. Set the programming language to Python 3 (must be installed first).
4. Deselect the option "Alfred filters results". Spotlight does this for us. Alfred should only show the results and don't mess with it.
5. Use the following Python script:

```python
"""Use Spotlight to search an Obsidian vault and present results to Alfred"""

import subprocess
import json
import sys
import os.path

MAX_RESULTS = 20
VAULT_PATH = "/path/to/your/obsidian-vault"

QUERY = sys.argv[1]
COMMAND = ['mdfind', QUERY, '-onlyin', VAULT_PATH]

with subprocess.Popen(COMMAND, stdout=subprocess.PIPE, text=True) as proc:
    results = []
    count = 0
    for path in iter(proc.stdout.readline, ''):
        count += 1
        if not path or count == MAX_RESULTS:
            break

        results.append({
            "title": os.path.basename(path),
            "subtitle": path.replace(VAULT_PATH, ""),
            "arg": path.replace("\n", ""),
            "type": "file:skipcheck"
        })

    json_object = json.dumps({"items": results})
    print(json_object)  # Alfred will pick this up
```

The Python script uses `mdfind` to search your notes and gives the results to Alfred in [a specific JSON format](https://www.alfredapp.com/help/workflows/inputs/script-filter/json/).

At this point, Alfred will show search results, but nothing will happen if you click on a result. To fix that, connect an “Open URL” action to the script filter:

![](/uploads/2023-03-how-i-use-alfred-to-search-obsidian-notes/alfred-workflow-obsidian-link.png)

The "Open URL" is configured to take the highlighted result and pass it to Obsidian:

![](/uploads/2023-03-how-i-use-alfred-to-search-obsidian-notes/alfred-workflow-obsidian-open-url-config.png)

Now try it out! Open Alfred, type "note", followed by your query and watch the results appear. Pick any result, hit enter, and Obsidian should open the correct note.

## Why use Spotlight + Alfred?
There’re a couple of reasons I prefer this setup over the built-in quick switcher or search feature of Obsidian:

* Spotlight is fast and already indexes your notes.
* Search ranking is better compared to Obsidian. I also feel like it has better fuzzy matching.
* I'm a heavy Alfred user and have countless of workflows to speed up my work. Adding Obsidian saves a bit more time.
* Alfred can be triggered anywhere you are. No need to switch to Obsidian first, before you can search.

One limitation of Spotlight is that we can't show a snippet of the note. But I found that to be a non-issue as Spotlight is quite accurate and my filenames are descriptive enough.

## Download the Workflow
Want to use it yourself but don't want to set everything up? 
[Download the workflow here](/uploads/2023-03-how-i-use-alfred-to-search-obsidian-notes/obsidian-search-alfred.zip).

Happy note taking!
