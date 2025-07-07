# 📃 gitdevlog — [![NPM version](https://img.shields.io/npm/v/gitdevlog.svg?style=flat)](https://www.npmjs.com/package/gitdevlog) [![NPM downloads](https://img.shields.io/npm/dm/gitdevlog.svg?style=flat)](https://npmjs.org/package/gitdevlog) 

> A tiny CLI + Git hook that asks: _“Why did you really make that commit?”_  
> And then quietly builds a timeline of your thoughts for future you... and your team.

---


## ⚡ TL;DR

A post-commit journaling sidekick for your Git workflow.  
After each commit, `gitdevlog` whispers:  
> Want to log this commit?

You drop a thought or two — a why, a hacky reason, a future warning.  
Boom. Logged, timestamped, and searchable forever.

---

## 🤔 What is this?

`gitdevlog` is a lightweight memory layer for developers.

It's not your Git message.  
It's the _story_ behind your Git message.

After every Git commit, it politely asks:
> Want to log this commit? (leave empty to skip)  
> Why \| Notes: `________________`

✅ You jot a short note — about your intent, context, or frustration  
✅ It saves that with the commit  
✅ Builds a searchable timeline of your reasoning  
✅ Helps avoid **re-debugging**, **context loss**, and **"why the heck did I do this?"**

---

## 💡 Why?

Because your commit message says:
> `fix: minor auth redirect`

...but your brain meant:
> _"Spent 2 hours on this weird redirect loop in Safari.  
Turns out the state param was missing from the callback URL. Rage."_

Let’s capture that. While it’s fresh.

"Git tells you what changed. This tells you why."

---

## 💡 MORE Why though?
Let’s be honest:
You’ve looked at your own code a week later and thought:

“Wth was I trying to solve here?”

You ?: Same.

Your team? Same.

Your future self? Definitely same. Probably filing a bug report against past-you.

But if you have genuinely solved this memory-gap problem...

We clearly have a lot to discuss.
I think we’re both building tools for developers because even superheroes forget why they saved the world , it's deep , —our tools might help developers remember their own genius moments. NOT CRYIINGGG ;( not at ALLLL . 



## ✨ Features

- 🧠 **Post-commit prompt** → `why` and `notes`
- 🗃 **Local logs** → stored in `.devlog/logs/`
- 🔍 `gitdevlog list` → view all past logs
- 🔎 `gitdevlog search <text>` → find old context, like "Find that bug note from 2 weeks ago"
- 🕰️ `gitdevlog timeline` → generate beautiful Markdown or HTML timelines
- 🖤 **Zero config**, works out of the box
- 📦 Ship as a reusable npm module

## 🚀 Getting Started

### Installation:

```bash
npm install -g gitdevlog
```

### Usage:

```bash
npx gitdevlog init
```
☝️ That sets up a post-commit hook for your current repo.

From now on, every commit is followed by:
```bash
Want to log this commit?
> Log (why | notes):
```
✔️ Leave it blank to skip
✍️ Type whatever you want
📦 Done

### CLI Commands

```bash
npx gitdevlog list
```
View all past logs

```bash
npx gitdevlog search "your search term"
```
Finds logs that mention “your search term” in any field. Magic.

```bash
npx gitdevlog timeline
```
Generates a Markdown timeline of your logs.

```bash
npx gitdevlog timeline --html
```
Generates a Dark Mode HTML timeline with 🔍 filtering and 🔃 sorting.

---
## 🧘 Ideal for:
🧑‍💻 Solo devs who never forgets ;)
👩‍👧‍👦 Teams who want more than "Update" commits
🐛 Debugging what you did last month
🧠 Leaving breadcrumbs for Future You™

---
## 🧠 Philosophy
Code is fast.
Context is fragile.

We write Git messages for machines and changelogs.
gitdevlog is for you. The human. The debugger. The coffee-powered context reclaimer.


## 🫡 Built With

12 lines of "I'll remember this later"

1 weekend of “let’s just ship it”

## 🛠️Author:
- [cinfinit](https://github.com/cinfinit) — a dev who’s tired of future-me yelling at past-me.

  In nut shell , this is how it actually started:
  
> "You can't remember why you made that commit. I can't either. Let's fix that."
