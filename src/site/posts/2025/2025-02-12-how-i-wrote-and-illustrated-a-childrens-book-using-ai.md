---
layout: post
title: "Bringing Foam Monsters to Life: How I Wrote and Illustrated a Children's Book Using AI"
description: "A behind-the-scenes look at how I used AI tools to write and illustrate a book for my kids, from story concept to final illustrations."
tags: [Parenting]
thumbnail: /uploads/2025-02-how-i-wrote-childrens-book-with-ai/thumb_timeline.jpg
upload_directory: /uploads/2025-02-how-i-wrote-childrens-book-with-ai/
---

I've always wanted to write a book. It's been on my bucket list for several years, but I never got around to it. Last summer I had a revelation: my kids love being read to, so why don't I write a story for them?

Since [building a YouTube spam filter with TensorFlow]({% link collections.posts, "2021-07-06-filtering-spam-on-youtube-with-tensorflow-and-ai.md" %}), I've been fascinated by how AI can solve creative and practical problems. This project was the perfect chance to push that even further.

Here's how I approached writing a children's book and how I used AI to illustrate it.
<!--more-->

## Backstory
Before diving in, I want to explain why I wanted to write a book in the first place.

I've always been obsessed with the process of crafting stories. When I was a kid, I would spend weekends with my dad watching the behind-the-scenes of our favorite movies. I especially like the ones of Pixar. I might have seen [the making of Finding Nemo](https://www.youtube.com/watch?v=g2zx3gcuXnk) about a hundred times.

At first glance, it _seems_ easy to write a good story, but behind-the-scenes documentaries reveal the truth: crafting compelling narratives takes time and A LOT of effort.

Now, drawing and 3D animation are outside my skill set, so writing a book seems like the next best thing!

My boys (Vince and Lewis) are 2 and 4, and they love being read to. 

## The spark of an idea
I wanted a story unique to our family, so I brainstormed our quirky habits and traditions.

One thing stood out though: a game we play during bath time.

I cover my hand in foam and pretend to be a foam monster that is coming to eat them. The boys then laugh and rush to pour water over the foam monster to reveal my hand again. 

It struck me that this would be the perfect story! What if the boys encountered a real foam monster?

![](/uploads/2025-02-how-i-wrote-childrens-book-with-ai/end-result-1.jpg)
*The end result*

## Writing an outline
Armed with this idea, I began writing an outline. In rough bullet points, I composed a story that went something like this:

* Vince and Lewis are walking along a river
* Suddenly, the water starts bubbling and an angry foam monster appears
* The boys panic and think about how they can get rid of the monster. Then, they spray it down with water blasters.
* When the monster calms down, it reveals that it has no friends and is sad
* The boys explain to the monster that it looks scary and that it needs to take on a more friendly shape.
* They become friends, and the boys return home when the sun is setting.

This outline was a good starting point, but it lacked depth and cohesion. Where did the foam monster come from? Why was it angry? Why does it need to change its appearance?

I asked my sister for feedback and she pushed me to incorporate a lesson into the story (just like my favorite Pixar movies do) and to think more deeply about the characters.

## Back to basics: meet the characters
To develop the characters, I wrote out a background story for each of them. I started with my boys, because I knew them best. I listed what they liked, their character traits, and so forth.

![](/uploads/2025-02-how-i-wrote-childrens-book-with-ai/dalle-exploration.jpg)
*AI drawing of my youngest son.*

The foam monster, however, was a lot harder. I asked myself: what do foam monsters want? What makes them happy? What makes them sad? What talents do they have?

None of these things were addressed in my initial outline, which made it feel hollow. I brainstormed a bit, and I came up with the following background story. 

Foam monsters are made of foam.  
Foam comes from soap.  
Foam appears whenever you're cleaning.  
So maybe foam monsters want things to be clean!

Throw this into my first outline, and you get a story about a foam monster that comes out of a river and is angry because people polluted the river with trash.

![](/uploads/2025-02-how-i-wrote-childrens-book-with-ai/dalle-angry-foam-monster.jpg)
*An angry foam monster*

## Second outline
Armed with this background story for my characters, I wrote a second outline, which was a lot better.

It was now clear *why* the foam monster was angry. Foam monsters want to keep things clean, and trash doesn't belong in the river! 

I could also incorporate a moral lesson. It’s okay to be angry, but you have to channel your anger appropriately.

And they have fun along the way as the foam monster uses his shape-shifting abilities to transform into a boat.

I also added some elements my kids would instantly recognize, like a red asphalt road that's close to our home.

![](/uploads/2025-02-how-i-wrote-childrens-book-with-ai/red-asphalt-road.jpg)

Eventually, I was happy with the outline and I started writing the actual story. This was relatively easy because I had invested a lot of time in writing the outline. Preparation really is half of the work!

## Using AI for feedback
Throughout the writing process, I used Claude extensively to brainstorm and ask for feedback. I tweaked the system prompt to give some context about what I was trying to achieve:

> You are a helpful writing assistant. You know everything about writing books for children between the ages of 1 and 4.  You can help me by answering my questions. You can also ask me questions. You can also deviate and brainstorm. Be honest and push back on my ideas for story when needed.
 
I then asked Claude to help with both the outline and the story. Not all feedback was useful, but it pointed out some (obvious) issues:

* A monster wanting to "eat" kids might be too scary for the target age group.
* The resolution feels quick. You could expand on how the boys and the monster become friends, maybe through a shared activity.
* Try incorporating a repeated phrase or sound effect throughout the story to engage kids.
* Add a moment where the boys doubt if they should be afraid of the monster. This helps kids deal with emotions.

Very valuable feedback, and I adapted accordingly.

It also proposed some things that didn't make it into the story, such as:

* "Consider adding a description of the boys" -> I haven't seen this in any of the books we're reading, they're always focussed on the story itself
* Explicitly mention the moral lesson: trash doesn't belong in the river

## The final story
The final story goes something like this:

* On a hot summer's day, Vince and Lewis are walking along a river. They have their water blasters with them to have fun and cool down.
* They suddenly hear people screaming in the distance. They discover an angry foam monster that came out of the river and is hurting people with its stingy foam.
* The boys learn that the foam monster is angry because people are polluting the river, and foam monsters want to keep things clean. 
* The boys explain it's okay to be angry, but you can't hurt people. They brainstorm for solutions for the trash problem.
* The foam monster transforms into a boat. The boys go aboard and fish the trash out of the river.
* They discuss how they can prevent trash from piling up again
* It's getting late. They hug, say goodbye, and the boys return home.

The story has two underlying lessons. You can be angry, but you should not be hurting people. Trash belongs in the bin.

## Generating illustrations with DALL-E 3
With the story finished, it was time to work on illustrations. My drawing skills are severely underdeveloped, so I decided to use generative AI tools. 

DALL-E 3 seemed like an obvious choice since it's included in my ChatGPT subscription. And while the initial tests went fine, I quickly ran into some issues.

For starters, DALL-E rewrites your prompt. No matter how much detail I added to my prompt, DALL-E always added additional details I didn't ask for. I tried asking it not to augment my prompt, but that didn't work.

> My prompt has full detail so no need to add more: [ACTUAL PROMPT]

Second, it was virtually impossible to generate several images in the same style while keeping the characters look consistent. The appearance of the boys could change dramatically from one page to the next.

![](/uploads/2025-02-how-i-wrote-childrens-book-with-ai/dalle-style-inconsistency.jpg)
*The style and characters would often change between generations*

And finally, it struggled to generate images of the foam monster. 

![](/uploads/2025-02-how-i-wrote-childrens-book-with-ai/dalle-foam-monster-issues.jpg)
*I guess it makes sense that AI models struggle with foam monsters.<br>They've never seen foam monsters during their training!*

## Switching to Leonardo.AI
I was so disappointed with DALL-E’s inconsistencies that I almost gave up on the project.

Luckily, I discovered several alternatives to DALL-E that offered better control over character consistency. I opted to go for [Leonardo.Ai](https://leonardo.ai/) and their Phoenix model. 

The biggest selling point was their “character reference” feature, which allows you to upload reference images to guide the model. Unfortunately, the Phoenix model, which I found produced the best results, didn’t support this feature yet. But luckily, it had an “image” or “style guidance” feature, which I found worked incredibly well.

![](/uploads/2025-02-how-i-wrote-childrens-book-with-ai/screenshot-leonardo-ai.png)
*Leonardo.ai's character and style guidance were life-savers!*

To further guide the model and ensure consistent images, I included detailed character descriptions in all my prompts. The foam monster was the hardest to describe, but luckily Claude provided a fantastic prompt that worked on the first try!

Here's the (extensive) prompt I used to generate all images:

> [PROMPT FOR THE MAIN IMAGE GOES HERE]
> 
> Description of characters:
> - Vince: a 3-year-old white boy with dark hair and brown eyes. He wears a jeans short, a white t-shirt, sandals.
> - Lewis: a 2-year-old white boy with blond hair and brown eyes. He wears brown shorts, a blue t-shirt, sandals.
> - Foam monster: A scary, bubbly foam monster. The monster is composed entirely of white, frothy foam with a vaguely humanoid shape. Its body is irregular and bulbous, covered in various-sized bubbles and foam clusters. The monster has glowing yellow eyes peeking out from within the foam, giving it an eerie appearance. It towers over the river, with foam dripping and oozing off its form.
> 
> Setting: a beautiful summer's day. Sun high in the vivid blue sky, only a few fluffy clouds.

Combining image guidance and detailed descriptions proved highly effective in maintaining character consistency across different prompts. And when the results deviated too much, I simply regenerated the image.

Switching to Leonardo.Ai re-energized me. I was making progress again and I quickly got the hang of writing prompts that would yield good results.

My only complaint is about the generation speed. It often took 30+ seconds to generate images. I'm an impatient person, so I would find myself get distracted quickly while waiting. But that's a minor issue, given the quality of the images!

## User testing
With the story and illustrations finished, I was ready to order a physical copy of the book. But just to be sure, I did a user test.

I read the story for my oldest son while recording his reaction with my webcam.

<video controls loop playsinline class="w-full aspect-[16/9]">
  <source src="/uploads/2025-02-how-i-wrote-childrens-book-with-ai/reading-test-with-vince.mp4" type="video/mp4">
</video>

He listened from start to finish and was captivated from the start. When the story ended, he asked to read it again. Mission accomplished!

## The end result
The last step in my process was to print the book. I contacted several local printers, but none could print hardcover books. So I used a photo book printing service instead.

![](/uploads/2025-02-how-i-wrote-childrens-book-with-ai/end-result-proud-dad.jpg)
*That is one proud-looking dad!*

I don't want to brag, but I'm super proud of the end result!

![](/uploads/2025-02-how-i-wrote-childrens-book-with-ai/end-result-2.jpg)

We ordered a few more copies and give them to our closest family and friends. I inscribed a personal message into each book, thanking everyone for the role they play in our lives.

## Time spent
Overall, I spent a roughly 15 hours working on this project. Most of my time was spent writing the outline and story in Obsidian.


![](/uploads/2025-02-how-i-wrote-childrens-book-with-ai/time-spent-writing-book.png)
*Yes, I do use an app to track how I spend my time.*

Here's a full breakdown:
* 5 hours in **Obsidian**: outlining and writing
* 4 hours in **Arc**: generating images in Leonardo.AI and brainstorming with Claude
* 2 hours in **Figma**: overlaying text on the images
* 2 hours in **Pixelmator**: making small edits to the images (brushing some backgrounds to make the text more legible)
* 21 minutes in **Albelli**: this is the photo book printing service I used

## Costs
In terms of cost, I spent €368,33. The bulk of this went toward the printing service.

In terms of AI usage, I spent less than €30 in total. Most of that was wasted on trying to get DALL-E to output consistent images. 

| Description                           | Cost        |
| ------------------------------------- | ----------- |
| DALL-E usage                          | €16,16      |
| Leonardo.AI subscription              | €11,60      |
| 2 test books                          | €45,49      |
| 12 final books (for friends & family) | €280,68     |
| **Total**                             | **€368,33** |

## Acknowledgements
This project took me a lot longer than I had initially expected. I’m very proud of the result and I’d like to thank some people for that.

First up: my sister. Thank you for pushing me to improve the story and your advice to incorporate a lesson into it. The book wouldn't be half as good without your feedback!

Also, a shout out to my kids from which I learn so much! They look differently at the world. They’re constantly questioning everything, which pushes me to explore new ideas and perspectives all the time.

And finally, a word of appreciation for my wife. Sorry you had to listen to hours of me talking about foam monsters and AI tools.

## What's next?
Maybe I'm overly ambitious, but I enjoyed this process so much that I want to write additional stories!

While I was researching how to approach this challenge, I came across a video by Lauren Valdez. This quote sums up why I want to write more stories:

> It's not about making a book. It's about weaving the fabric of your family's history and dreams into something tangible.