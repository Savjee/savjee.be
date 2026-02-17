---
layout: post
title: "Serverless Anagram Solver with Cloudflare R2 and Pages"
description: "How I rebuilt my anagram solver to be completely static. Using pre-computed solutions and Cloudflare R2/Pages for a fast, serverless experience."
tags: ["Anagram solver", "Cloudflare", "Cloudflare Pages", "Cloudflare Workers"]
not_featureable: true
toc_enabled: true
thumbnail: /uploads/2022-09-serverless-anagram-solver/thumb_timeline.jpg
upload_directory: /uploads/2022-09-serverless-anagram-solver
---

Six years ago, I reworked my anagram solver so it would run on top of AWS Lambda and DynamoDB. However, this year I realized I didn't need server-side code or a database at all. I could make it completely static by pre-computing anagram solutions.

<!--more-->

## Recap: how to solve an anagram
You can solve anagrams in multiple ways, but the approach I use is simple. Take each word in a dictionary and put their letters in alphabetical order:

```
dog -> dgo
```

Then store all words in a database and use their alphabetized versions as the key:

```
| alphabetized | solutions |
| dgo          | dog, god  |
```

Now, when a user wants to solve an anagram, take their input, alphabetically order the letters, and lookup that key in the database. You'll find all the solutions for the given anagram.

## From PHP and MySQL to Lambda and DynamoDB
The very first iteration of my anagram solver was using PHP and MySQL as backend. Then, [I migrated everything to AWS Lambda and DynamoDB]({% link collections.posts, "2016/2016-01-20-Building-serverless-anagram-solver-with-aws-dynamodb-lambda-s3-cloudfront-api-gateway.md" %}) when "serverless" became a hot topic.

![](/uploads/2022-09-serverless-anagram-solver/architecture-aws.png)

## Realization: I don't need a database!
After reading one of [Troy Hunt's blog posts about how Pwned Passwords works](https://www.troyhunt.com/understanding-have-i-been-pwneds-use-of-sha-1-and-k-anonymity/), I realized I don't need a database at all. 

I could replace the database with static JSON files. One file for each "alphabetized" word. So the file `dgo.json` would contain:

```json
["dog", "god"]
```

However, creating one JSON file for each word in the dictionary would create a ton of files. The English dictionary alone has over 100,000 words. Hosting this many files is unpractical, especially considering that I want to support different languages.

## Keyspace
So instead, I grouped words together. Not only does that reduce the file count, it also allows for better caching.

So here's the idea I got from Troy Hunt's service: use a hash function to create a keyspace. This allows me to split the dictionaries into equal parts and group many anagram solutions together.

But wait... Hash functions are specifically designed to make it very hard to find two pieces of data that produce the same hash. So each word in the dictionary will have a unique hash. How do I group them?

Well, simply truncate the hash! By only looking at the first three characters of an MD5 hash, we get 16^3 or 4096 possible combinations. 

![](/uploads/2022-09-serverless-anagram-solver/anagram-keyspace.png)

So, I've effectively split my dictionary into 4096 equal parts (roughly).

## Better caching
One side effect of this system is that caching becomes more effective. Users have a higher chance of hitting a JSON file that is already cached, either by a CDN like Cloudflare, or by their browsers.

For example: let's say you want to solve the anagram "vloser". The first step is to alphabetize the input and calculate the MD5 hash.

```
input: vloser
alphabetized: elorsv
MD5 hash: 851e064968c9e29a9a39b0eb1d022168
```

Now we truncate the hash to 3 characters, and we know to fetch the JSON file `851.json`, which contains the solution for your anagram: "solver" or "lovers".

But that same file also contains the solutions for other words like accelerators, unauthenticated, instrumentalist, undemanding, assembly, swipe, rewritten, demagnetised, ...

On the off chance that would enter an anagram that matches these solutions, your browser will already have the correct JSON file sitting in its cache.

## The actual code
The code to "solve" anagrams with this system is very simple. Alphabetize the input, calculate the hash, and make a GET request to get the correct JSON file.

Because each JSON file contains many pre-computed solutions, we have to filter out the ones that match the user's input. And that's it!

Here's how I implemented the logic in Typescript:
```typescript
const alpha = alphabetize(anagramInpt.value);
const prefix = getHashPrefix(alpha);
const lang = languageSelect.value;

// Fetch the correct JSON file
const res = await fetch(`api/v1/${lang}/${prefix}.json`)
					.catch(e => {
						// Handle error
					});
const data = await res.json()
					.catch(e => {
						// Handle error
					});

// The JSON file contains many pre-computed solutions. Find the one
// that mateches the user's input
const solutions = data.data.find(el => el.alpha === alpha);
if(!solutions || !solutions.words || solutions.length === 0){
	resultsDiv.innerHTML = noResultsHtml;
	return;
}
```

The full source code is [available on GitHub](https://github.com/Savjee/anagram-solver).

## Deploying the site to Cloudflare Pages
Next step: hosting everything. I used Cloudflare Pages since I’m using it for this website and it has been rock solid.

One issue though: Pages limits you to 20,000 files per project. That would only allow me to support 5 languages, given that I split each dictionary into 4096 JSON files. But I want to support many more.

## Cloudflare R2 to the rescue!
I didn't want to give up on Cloudflare Pages, so I decided to host the dictionaries on Cloudflare R2. It's an object storage service like AWS S3. So I created a bucket and uploaded all dictionaries to it.

![](/uploads/2022-09-serverless-anagram-solver/architecture-cloudflare.png)

R2 buckets differ from S3 buckets in the sense that you cannot share files publicly. All buckets are private by default, and you have to use a Cloudflare Worker to expose files to the internet.

So that's exactly what I did by using [Cloudflare Pages functions](https://developers.cloudflare.com/pages/platform/functions/). All I had to do was create a JavaScript file inside the `functions/` folder of my project:

```
.
├── functions
│ └── api
│     └── [[path]].js
└── src-www
  ├── css
  ├── index.html
  └── js
```

The location of the script is used to generate a URL for it. So in this case, the path `/functions/api/` will be accessible through: `https://anagram.savjee.be/api/*`.

The Worker itself is very simple: it receives a request, checks if the requested file exists in the R2 bucket, and returns it. The Worker also sets a `Cache-Control` header to make sure that browsers will cache files aggressively.

```js
export async function onRequestGet({ request, env }) {
  try{
    const requestUrl = new URL(request.url);
    const objKey = requestUrl.pathname.slice(1);

    // Try to fetch the object from R2
    const obj = await env.R2_API_STORAGE.get(objKey);

    if (obj === null) {
      return new Response('Not found', { status: 404 });
    }

    // If we land here, the object exists in R2. Now make sure that it's cached
    // aggressively by the browser as the file won't change in the future.
    const responseHeaders = new Headers();
    obj.writeHttpMetadata(responseHeaders);
    responseHeaders.set('etag', obj.httpEtag);
    responseHeaders.append('Cache-Control', 'public, max-age=604800, immutable');

    return new Response(obj.body, {
      headers: responseHeaders
    });
  }catch(e){
    return new Response("Error occured: " + e, {status: 500});
  } 
}
```

I really like the private-only approach that Cloudflare went for. The only downside is that each request incurs costs to your Worker and to R2. One way this could be solved is by caching the result of the Worker, but that's up to Cloudflare.

And that was it. The anagram solver is now powered by Cloudflare Pages and R2. And no databases were ~~needed~~ harmed.

## Rough edges
I'm slowly using Cloudflare for more and more projects. But in this case, I encountered some rough edges.

<hr>

<details>
    <summary><i>The first issue I encountered has been fixed by Cloudflare, so this is no longer applicable (click to view more details).</i></summary>

First up: when you use Functions inside your Pages project, your function will process <b>ALL</b> requests to your website. Even though the function is linked to the path <code>/api/*</code>.<br>

My website receives around 2000 visits per day. Let's assume the average page loads 10 resources (HTML, JavaScript, CSS, images). That means the function will get called 20,000 times for no good reason! This is so silly that I double checked this [with the community](https://community.cloudflare.com/t/unexplainable-functions-request-count/410108/4). It appears to be a limitation that Cloudflare is going to address soon, but weirdly the limitation [is not documented](https://developers.cloudflare.com/pages/platform/known-issues/).

</details>

<hr>

Secondly: Cloudflare gives you 100,000 free requests for functions inside your Pages projects. Given the limitation I just mentioned, I [requested an increase of this quota](https://docs.google.com/forms/d/e/1FAIpQLSe4N0BjIxu9AuissCAtYjXUovViXmdx2zopjzASaJi_SImJsw/viewform), just to be sure. But Cloudflare doesn't seem to monitor this form at all. It's been over a month, and I haven't received a reply or an increased quota. Weird!

And lastly, there's no way to view the logs of your functions (something that is available on regular Workers).

That being said, Cloudflare gets the benefit of the doubt, as their services are usually very good, and because Functions is currently in beta.

## Conclusion & source
So that was it. My anagram solver now runs entirely on Cloudflare without the need of a database. You can check it out here: [https://anagram.savjee.be](https://anagram.savjee.be)

The source code is available on GitHub: [https://github.com/Savjee/anagram-solver](https://github.com/Savjee/anagram-solver)

## Related Content
For an introduction to serverless concepts, watch: [The Serverless Hype Explained!](https://www.youtube.com/watch?v=tgFiOzVEL0Q).
