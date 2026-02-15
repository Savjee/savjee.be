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
        <h2 class="text-xl font-bold mb-4">Read one of the previous editions while you wait:</h2>
        
        <ul class="list-none p-0">
            {% assign recent_issues = collections.newsletter | reverse %}
            {% for issue in recent_issues %}
                {% if forloop.index <= 5 %}
                    <li class="mb-4 border-l-4 border-savjeered pl-4">
                        <a href="{{ issue.url }}" class="no-underline block group">
                            <span class="text-sm opacity-60">Issue {{ issue.data.title | split: ":" | first }} &middot; {{ issue.date | date: "%B %Y" }}</span>
                            <span class="block font-bold group-hover:underline text-lg">{{ issue.data.title | split: ":" | last | strip }}</span>
                        </a>
                    </li>
                {% endif %}
            {% endfor %}
        </ul>

        <div class="mt-8">
            <a href="/newsletter/" class="font-bold underline">View all past editions &rarr;</a>
        </div>
    </div>

    <p class="mt-12 opacity-75">
        Thanks again,<br/>
        <strong>Xavier</strong>
    </p>
</div>