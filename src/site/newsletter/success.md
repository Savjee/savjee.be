---
layout: page
title: Welcome aboard!
permalink: newsletter/signup/success/
eleventyExcludeFromCollections: true
---

<div class="prose dark:prose-dark max-w-none">
    <p>
        Thanks for joining the Simply Explained newsletter. It's an absolute delight to have you on board!
    </p>

    <p>
        You will receive a welcome email shortly. After that, you can expect a monthly dose of nerdy, tech-focused, and science-heavy news delivered straight to your inbox.
    </p>

    <div class="mt-12">
        <h2 class="text-2xl font-bold mb-2">While you wait for the next edition...</h2>
        <p class="mb-6">Why not catch up on some of the recent issues? Here are a few to get you started:</p>
        
        <div class="flex flex-col gap-y-12 not-prose">
            {% assign recent_issues = collections.newsletter | reverse %}
            {% for issue in recent_issues %}
                {% if forloop.index <= 5 %}
                    <div>
                        <span class="text-sm opacity-60 block mb-1">Issue {{ issue.data.title | split: ":" | first }} &middot; {{ issue.date | date: "%B %Y" }}</span>
                        <a href="{{ issue.url }}" class="font-bold text-xl text-savjeered hover:underline decoration-2 underline-offset-4 leading-snug">{{ issue.data.title | split: ":" | last | strip }}</a>
                    </div>
                {% endif %}
            {% endfor %}
        </div>

        <div class="mt-10">
            <a href="/newsletter/" class="font-bold underline text-savjeered hover:text-red-700 transition-colors">View all past editions &rarr;</a>
        </div>
    </div>

    <p class="mt-12 opacity-75">
        Thanks again,<br/>
        <strong>Xavier</strong>
    </p>
</div>