---
name: simply-explained-blog-writer
description: Write and edit blog posts in the Simply Explained voice and structure for savjee.be. Use when the user asks to draft, outline, rewrite, or polish a blog post for Simply Explained, including technical tutorials, project writeups, investigations, and yearly retrospectives.
---


# Simply Explained Blog Writer

Use this skill for content under `src/site/posts/`.

## Quick Start

1. Confirm the post goal: tutorial, build log, investigation, or retrospective.
2. Gather inputs: topic, target audience, desired depth, and whether the project is complete.
3. Draft using the structure patterns below.
4. Match the frontmatter and formatting conventions.
5. Run the quality checklist before finalizing.

## Frontmatter and File Conventions

- **Path format:** `src/site/posts/YYYY/YYYY-MM-DD-slug.md`
- **Required frontmatter fields:**
  - `layout: post`
  - `title: "..."` (clear, specific, often outcome-oriented)
  - `description: "..."` (1 sentence, practical value statement)
  - `tags: [Tag1, Tag2]`
- **Common optional fields:**
  - `thumbnail: /uploads/YYYY-MM-short-slug/thumb_timeline.jpg`
  - `upload_directory: /uploads/YYYY-MM-short-slug/`
  - `meta_tags: ["keyword 1", "keyword 2"]`
  - `toc_enabled: true` (long technical posts)
  - `not_featureable: true` (specialized or less evergreen posts)
  - `date_updated: YYYY-MM-DD` (when substantially updated)

## Voice and Style Rules

- Write in **first person** with a practical, builder mindset.
- Start with a concrete motivation and expected outcome.
- Keep tone friendly, direct, and lightly informal (small humor is fine).
- Prefer short paragraphs and high information density.
- Be transparent about mistakes, constraints, and trade-offs.
- Use concrete numbers (cost, time, counts, thresholds, performance) when possible.
- Avoid generic filler, hype, or vague claims.

See [voice-and-structure.md](voice-and-structure.md) for detailed patterns derived from recent posts.

## Structure Patterns

Use one of these as your default skeleton.

### 1) Technical Tutorial / Build Log

1. Hook + motivation (2-4 short paragraphs)
2. `<!--more-->`
3. High-level setup/architecture
4. Implementation sections (`##`) in execution order
5. Code/config snippets with short commentary
6. Results/validation (measurements or observed behavior)
7. Limitations/rough edges
8. Conclusion + optional next steps/downloads/source links

### 2) Investigation / Data Analysis

1. Hook + question being investigated
2. `<!--more-->`
3. Method (script/process/data source)
4. Findings with tables/figures
5. Interpretation and caveats
6. What is next

### 3) Yearly Retrospective

1. Context and scope of reflection
2. `<!--more-->`
3. Metrics snapshot
4. Wins and misses
5. Review of prior goals
6. New goals
7. Thank-you / close

## Formatting Conventions

- Add `<!--more-->` after the intro section (usually after 1-3 paragraphs).
- Prefer `##` headings with descriptive, practical names.
- Use bullets for lists, tables for comparisons, and fenced blocks for code/config.
- Add images/diagrams where they explain architecture or outcomes.
- When relevant, link related internal posts with project link syntax.

## Quality Checklist

- Intro clearly states problem + payoff.
- Each major section adds concrete progress, not commentary only.
- At least one concrete detail per major section (number, config, command, example, or measured result).
- Trade-offs, failures, or limitations are acknowledged.
- Ending summarizes result and gives a practical takeaway.
- Frontmatter and file path match project conventions.

## Output Contract

When drafting a post, provide:

1. Full markdown in publish-ready format.
2. Frontmatter filled with best-effort values.
3. Optional TODO markers for missing assets (images, diagrams, final metrics).
