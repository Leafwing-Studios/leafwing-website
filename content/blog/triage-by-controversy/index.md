+++
title = "Triage-by-controversy and community review"
description = "Making good use of open source enthusiasm"
date = 2023-09-09
author = "Alice I. Cecile"

[taxonomies]
tags = ["bevy", "open source", "development philosophy"]
+++

Popularity is always a mixed blessing.
Get enough momentum, and a big enough scope, and that fascinating open source project you spent a year writing on your own might just [grow out of control](https://bevyengine.org/news/scaling-bevy/).
You want to keep quality high, and control the rate of change for both library devs and consumers, but you *can't* keep up with the firehose on your own.

[Three years ago](https://bevyengine.org/news/bevys-third-birthday/), that happened to [Bevy](https://bevyengine.org/), the open source Rust game engine.
I stumbled across the project as I sought out a better way to make video games, got salty about the terrible docs and lack of issue triage, and well, now I'm one of its [four maintainers](https://bevyengine.org/community/people/).
Thanks to the help of the [64 generous sponsors](https://github.com/sponsors/alice-i-cecile) for helping me keep the lights on during all of it 💚

So, you have star engineer and architect, a huge collection of people eager to help, and an absolute mountain of features, bugs and documentation to get through.
How do you let the community help, without sacrificing your vision or rejecting ambitious proposals outright?

We've invented a bit of a system over at Bevy to manage this.
It's unorthodox, but, generally speaking, it works really well!
The way I see it, there are three key parts:

1. **Contributions are a blessing:** An attitude that contributions are inherently valuable and overwhelmingly made in good faith, no matter the experience level.
2. **Community reviews:** Encouraging code review from anyone who wants to take the time, and giving both their approval and concerns genuine weight.
3. **Triage-by-controversy:** The lower the stakes, and the more consensus there is about a change, the easier it should be to merge.

The first is a cultural value, and something that the team works hard to instill in everyone who joins the community.
It's why I [do a weekly merge train](https://elk.zone/mastodon.gamedev.place/@alice_i_cecile/110968204517145096), catching up on approved PRs, and hyping up the work that the community has done for us.

It's easy to get this flood of contributions, get overwhelmed, and put up barriers to participation.
Stricter rules, archaic patch-by-mailing-list infrastructure, gatekeeping with bad faith technical questions, requiring a clean rebased commit history, adding a stale bot...

And that works! Much like throwing 90% of the resumes you receive directly into the trash to filter out unlucky candidates, you're no longer overwhelmed by suggestions you can't review.
But that's not the choice we made, for better or for worse, and the [easier we make it to contribute](https://github.com/bevyengine/bevy/blob/main/CONTRIBUTING.md) the *worse* our ratio of trusted experts to newcomers becomes.

Fortunately:

1. The huge majority of people who interact with your project are trying to help in good faith, and those that aren't are almost always easily spotted.
2. The expert/noob dichotomy is false: even if they've never touched your project before, contributors are bringing genuine skills and experience to the table.
3. People are generally pretty good at evaluating the limits of their own expertise.

Enter: community reviews.
If the problem is that we have too many contributions, and they're not polished or well-thought through: just turn the contributors on each other!
It turns out, if you empower the community to do so, they *will* provide genuine critical feedback on other people's PRs.
Especially if they want them merged too!

The mechanics are pretty simple:

1. Anyone (literally, anyone) can review a PR. GitHub just lets you do it!
2. Once two people (other than the author) have approved the PR, it gets [a label, marking it as ready for final review by a maintainer](https://github.com/bevyengine/bevy/pulls?q=is%3Aopen+is%3Apr+label%3AS-Ready-For-Final-Review).
3. We hand out triage rights (which let you label issues and PRs) to anyone who's contributed to the project, to make sure things stay tidy and the labels above are added quickly and reliably.
4. Once a week, I go through that label and make a final call on each of the PRs that has that label: either merging it, suggesting revisions or telling them that there's now merge conflicts, sorry!

Community reviews are incredibly useful for three reasons.

First, as a maintainer: every community review cuts down on the time you have to spend fixing typos, complaining about missing tests and docs or teaching a newcomer how CI works.
It's not just about the hours saved: latency in reviews is one of the biggest causes of dead PRs and contributor burnout.

Next, the act of reviewing helps build skills and confidence in the *reviewers*.
As you read more code, ask questions and critically analyze how things are done, your skills and familiarity with the code base grow rapidly.
That's how I learned most of what I know about Rust!

Finally: this process builds a sense of shared ownership.
Bevy isn't just Cart's anymore: it belongs to *all of us*.
We care about the quality and success of the project, and not just because it would be useful to us.

This all sounds lovely; idyllic even!
But what happens when contributors *can't* come to an agreement on what should be done to improve a PR, or even if that work should be done at all?
Ultimately, you need an escalation mechanism: the PR must be kicked up to someone(s) with expertise, who must make a decision in the face of active disagreement.

Fortunately, even if they can't agree to disagree, people can virtually always *agree that they're disagreeing*.
And if they *don't*, well, that's just proof that there's controversy to be solved!
The next step is obvious: mark the PR with a [label denoting its controversy](https://github.com/bevyengine/bevy/pulls?q=is%3Aopen+is%3Apr+label%3AS-Controversial), adding it to the backlog of "things that need serious attention from experts".

When combined with community reviews, the ultimate effect is striking:

1. Non-controversial PRs can be merged at a low standard of review, without the need for sign-off by an [expert in that domain](https://bevyengine.org/news/scaling-bevy-development/).
2. Controversial PRs, either due to their ambition, their tradeoffs or their flaws, are bubbled up and given the focus and attention they deserve from experts (eventually).
3. The contribution process ends up triaged by controversy: the easier a PR is to review (because it's well-made, clearly motivated and explained, well-scoped, with docs and tests), the faster it gets reviewed and merged.
4. These incentives create self-reinforcing community norms that drive better PRs (because everyone wants their work to be merged quickly and smoothly).
5. Because maintainers aren't exempt from these mechanisms, *we* try our best to build community buy-in and don't get sloppy on our own work.

Over the years, I've watched these norms strengthen: there's way more docs, tests, and helpful PR descriptions than there used to be.
And no one had to nag contributors into doing it: they did so willingly.
That's systems thinking for you, eh?

So, in conclusion: I think these practices are incredibly useful for most open source projects, especially as they grow, and simply make the experience kinder and more pleasant.
I'd really like to see them catch on, so if you have any questions about how to adapt these lessons to your project (or examples of other projects that work kinda like this) please send an email to `alice@leafwing-studios.com`.
