---
layout: page
title: Welcome aboard! 🚀
permalink: newsletter/signup/success/
eleventyExcludeFromCollections: true
---

<div class="prose dark:prose-dark max-w-none">
    <p class="text-xl">
        Thanks for joining the Simply Explained newsletter. It's an absolute delight to have you on board!
    </p>

    <p>
        You will receive a welcome email shortly. After that, you can expect a monthly dose of nerdy, tech-focused, and science-heavy news delivered straight to your inbox.
    </p>

    <hr class="my-10" />

    <h2 class="text-2xl font-bold mb-6">While you wait for the next edition...</h2>
    
    <p class="mb-8">Why not catch up on some of the most popular recent issues? Here are a few to get you started:</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
        {% assign recent_issues = collections.newsletter | reverse | limit: 4 %}
        {% for issue in recent_issues %}
            <a href="{{ issue.url }}" class="block p-6 bg-savjeelightgrey2 dark:bg-darkmode-alt-bg border border-transparent hover:border-savjeered transition-colors rounded-lg group">
                <p class="text-savjeered font-mono text-sm mb-2">Issue {{ issue.data.title | split: ":" | first }}</p>
                <h3 class="text-xl font-bold group-hover:text-savjeered transition-colors">{{ issue.data.title | split: ":" | last | strip }}</h3>
                <p class="text-sm text-savjeelightgrey4 mt-2">Sent on {{ issue.date | date: "%B %d, %Y" }}</p>
            </a>
        {% endfor %}
    </div>

    <div class="mt-10 text-center">
        <a href="/newsletter/" class="inline-block bg-savjeered text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors no-underline">
            View all past editions
        </a>
    </div>

    <p class="mt-12 opacity-75">
        Thanks again,<br/>
        <strong>Xavier</strong>
    </p>
</div>