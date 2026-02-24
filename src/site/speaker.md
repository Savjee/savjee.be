---
layout: page
title: Speaking
description: Xavier Decuyper gives clear, practical talks that make complex tech understandable for broad audiences.
---

<div class="max-w-4xl mb-12">
    <h1 class="text-5xl font-extrabold text-savjeeblue dark:text-savjeewhite mb-5">Speaking</h1>
    <p class="text-xl leading-relaxed text-savjeeblack dark:text-savjeewhite">
        Simply Explained, but on stage. I give practical talks that make complex tech understandable for broad audiences.
    </p>
</div>

<div class="grid md:grid-cols-3 gap-4 mb-14">
    <div class="bg-savjeelightgrey5 dark:bg-darkmode-alt-bg rounded-lg p-5">
        <h3 class="text-lg font-bold mb-2">Clarity first</h3>
        <p class="m-0 text-sm text-savjeelightgrey3 dark:text-savjeewhite">No jargon overload. Clear mental models people remember.</p>
    </div>
    <div class="bg-savjeelightgrey5 dark:bg-darkmode-alt-bg rounded-lg p-5">
        <h3 class="text-lg font-bold mb-2">Technical depth</h3>
        <p class="m-0 text-sm text-savjeelightgrey3 dark:text-savjeewhite">Accurate content for technical audiences, explained accessibly.</p>
    </div>
    <div class="bg-savjeelightgrey5 dark:bg-darkmode-alt-bg rounded-lg p-5">
        <h3 class="text-lg font-bold mb-2">Actionable</h3>
        <p class="m-0 text-sm text-savjeelightgrey3 dark:text-savjeewhite">People leave with ideas they can apply immediately.</p>
    </div>
</div>

<h2 class="text-3xl font-bold mb-6">Past talks</h2>

<div class="space-y-5">
{% for talk in collections.talks %}
    <article class="border border-savjeelightgrey4 dark:border-savjeelightgrey3/30 rounded-lg p-5">
        <h3 class="text-2xl font-bold text-savjeeblue dark:text-savjeewhite mt-0 mb-1">
            <a href="{{ talk.url }}" class="no-underline hover:underline">{{ talk.data.title }}</a>
        </h3>
        <p class="text-savjeelightgrey3 mb-3">{{ talk.data.conference }}{% if talk.data.location %} • {{ talk.data.location }}{% endif %} • {{ talk.date | date: "%B %-d, %Y" }}</p>
        <p class="mb-0">{{ talk.data.summary }}</p>
    </article>
{% endfor %}
</div>

<div class="bg-savjeeblue dark:bg-savjeelightgrey3 text-savjeewhite p-8 rounded-lg mt-14 text-center">
    <h3 class="text-2xl font-bold mb-4">Want me to speak at your event?</h3>
    <p class="mb-6">I’m available for keynotes, workshops, and conference talks.</p>
    <a href="mailto:hello@savjee.be" class="inline-block bg-savjeered hover:bg-savjeewhite hover:text-savjeered text-savjeewhite font-bold py-3 px-8 rounded-md no-underline transition-colors">
        Get in touch
    </a>
</div>
