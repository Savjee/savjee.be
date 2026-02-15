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
        
        <div class="not-prose">
            {% assign recent_issues = collections.newsletter | reverse %}
            {% for issue in recent_issues %}
                {% if forloop.index <= 5 %}
                    <div style="border-left: 4px solid #E62643; padding-left: 1.5rem; margin-bottom: 3rem;">
                        <span style="font-size: 0.875rem; opacity: 0.6; display: block; margin-bottom: 0.25rem;">Issue {{ issue.data.title | split: ":" | first }} &middot; {{ issue.date | date: "%B %Y" }}</span>
                        <a href="{{ issue.url }}" style="font-weight: bold; font-size: 1.25rem; color: #E62643; text-decoration: none; line-height: 1.375;">{{ issue.data.title | split: ":" | last | strip }}</a>
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