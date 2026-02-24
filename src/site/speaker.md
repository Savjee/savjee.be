---
layout: page
title: Speaking
description: Xavier Decuyper gives clear, accessible talks that make complex tech understandable for a broad audience.
---

<div class="max-w-3xl mb-12">
    <h1 class="text-5xl font-extrabold text-savjeeblue dark:text-savjeewhite mb-6">Speaking</h1>
    <p class="text-xl text-savjeeblack dark:text-savjeewhite leading-relaxed">
        Simply Explained, but on stage. I give clear, practical talks that break down complex technical concepts for a broad audience.
    </p>
</div>

## What I typically speak about

- Making complex technologies easy to understand
- Explaining blockchain and crypto concepts without hype
- Helping technical teams communicate clearly with non-technical audiences

## Past conferences

<div class="space-y-6 mt-8">
{% for talk in collections.talks %}
    <div class="border-l-4 border-savjeered pl-6 py-2">
        <h3 class="text-2xl font-bold text-savjeeblue dark:text-savjeewhite">
            <a href="{{ talk.url }}" class="no-underline hover:underline">{{ talk.data.conference }}</a>
        </h3>
        <p class="text-savjeelightgrey3 mb-2">{{ talk.data.location }} • {{ talk.date | date: "%B %-d, %Y" }}</p>
        <p class="mb-3">{{ talk.data.summary }}</p>
        <a href="{{ talk.url }}" class="text-savjeered font-medium hover:underline">View talk details & recording →</a>
    </div>
{% endfor %}
</div>

## Want me to speak at your event?

I’m available for keynotes, workshops, and conference talks.

<div class="bg-savjeeblue dark:bg-savjeelightgrey3 text-savjeewhite p-8 rounded-lg mt-12 text-center">
    <h3 class="text-2xl font-bold mb-4">Let's connect</h3>
    <p class="mb-6">Interested in having me speak at your conference, meetup, or company event?</p>
    <a href="mailto:hello@savjee.be" class="inline-block bg-savjeered hover:bg-savjeewhite hover:text-savjeered text-savjeewhite font-bold py-3 px-8 rounded-md no-underline transition-colors">
        Get in touch
    </a>
</div>
