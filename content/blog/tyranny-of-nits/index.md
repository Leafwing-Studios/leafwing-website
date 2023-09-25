+++
title = "The Tyranny of Nits"
description = "How open source work sputters and dies"
date = 2023-09-23
author = "Alice I. Cecile"

[taxonomies]
tags = ["open source", "development philosophy"]
+++

Time and again, I've seen good open source work die, sputtering and gasping, as it's bogged down in a cacophony of complaints, and left to bit rot with no one willing to stick out their neck and say "this is good enough".
Over time, the rotten fruits of labor pile up: your [in-flight features accumulate](https://deterministic.space/rust-2018.html) as key steps fail for nebulous reasons, and your best contributors quietly burn out, fed up with not being able to actually get things *done*.

But why does this actually happen?
No one is acting *maliciously* after all.
How can a team of people, working towards a shared goal, screw things up in such a pervasive and predictable pattern?

And that right there is the key insight: stop thinking about these problems as something that is caused by (or can be fixed by!) individual behavior.
**Systematic problems demand systematic analysis and systematic solutions.**
So what's the underlying system here, and how is it broken?

Day-to-day, open source software development runs on code review.
It's a great way to transfer knowledge and best practices,
align on goals and vision,
and perhaps most importantly, it's one of the only tools to avoid [complete chaos](https://helixpedia.fandom.com/wiki/Twitch_Plays_Pokemon) when literally anyone could change your code.

Accordingly, if your code review process sucks, helping out your open source project is going to suck.
There's a lot of different ways it could suck, to be fair: you could be [drowning in triage and backlog hell](https://www.leafwing-studios.com/blog/triage-by-controversy/), or you could simply have a [terrible person or three](https://geekfeminism.fandom.com/wiki/Missing_stair) making everything miserable.

But this post isn't about that.
It's about the talented and principled engineers who, through their well-intentioned suggestions and feedback, grind contributions to a halt.

You see, the limiting factor in open source isn't time, and it isn't effort.
It's "give-a-fuck".
Get someone properly [nerd sniped](https://xkcd.com/356/) and they'll spend entirely disproportionate effort trying to fix or improve open source projects.
Because fundamentally, it's *fun*!

But when it feels like they're being dragged down by pointless minutia, or can't make progress, they'll wander off in frustration and find something better to do.
Even when you're talking about contributions done as part of their job: waste their time and next time they won't file or fix that little bug.
Do it enough and they'll bite the bullet and migrate away.

**Progress is key.** To the greatest extent you possibly can, as a maintainer and reviewer, you need to keep the ball rolling on work. Otherwise, it will stop!

So far, none of this is very controversial.
If you've been a software developer for long at all, you've been on the receiving end of nits and scope creep,
or watched it block a feature that you've desperately awaited as a functioning PR just quietly dies.
It's really tempting, and really easy, to just blame the reviewer here.
If they just chilled, just let the nits slide, just fixed them themselves, didn't scope creep: then everything would be okay!

But that's not a real solution for anyone other than "the nitpicking reviewer".
Why does questionable but well-intenioned behavior quietly derail important work?

## Overruling objections: naive consensus is terrible actually

To understand this, we need to examine the decision making process of open source projects, as they *actually* exist.
Once a PR is opened, what happens to it?

Open source projects tend to run on **naive consensus by default.**
The operating semantics are simple:

1. If everyone says "LGTM", the work gets merged.
2. If someone reasis a concern, we wait for the author to fix it.
3. If the author doesn't fix the concern, the PR stays open (or gets closed as stale).
4. If the author comes back and says "that's not a problem actually", then we get orgnizational undefined behavior.

We even made a [witty, heart-breaking game](
https://leafwing-studios.itch.io/consensus-together) you can play with your friends/teammates/worst enemies, if you don't believe that naive consensus itself is at fault here.

These rules make open source pretty good at saying yes to uncontroversial things,
and extremely good at saying no to controversial things, because a conflict-driven stalemate or a timeout due to excessive revisions is still a no.

But that's a *problem*: you have to be able to say yes to controversial decisions too!
Axiomatically: to make a decision, you have to both be able to say no, and to say yes.
If your project works like this, your project **can't make decisions about the things that matter.**
You have to keep making decisions, day after day, or your momentum will die and everything will slowly rot.
It doesn't even matter if they're "right": the very fact that a decision was made staves off this decay.

The classical solution here is to have a BDFL, or perhaps a code owner, who can shut down discussion, merge PRs over objections and close issues as "not planned".
As long as they're not overworked (never happens), things function pretty smoothly.

But that's not the only patch: delegation, binding votes or [more sophisticated consensus-based decision making processes](https://www.sociocracyforall.org/sociocracy/) all offer another way.
Debate these and experiment: I think any of them can work just fine.
Just don't ignore this problem!

## Nit-pick arithme-tick

As you might guess, there are two ways to solve nitpicking in code review: reduces the nits that need to be picked, and reduce the rate at which pickable nits are picked at.

The first strategy is quite effective:
ensure that code that comes in is free of obvious trivial mistakes.
Linters and formatters are great for that!

But just as importantly: invest in paying off your tech debt and clarifying your architecture.
If it's *obvious* how to do something, you won't have to waste everyone's time explaining that someone did something the wrong way.
Get those eager new contributors to help, seriously.

On the other hand, you could try to reduce the maount of nits that are picked.
I don't actually think that telling reviewers "don't worry about this stuff" is generally a useful strategy: it tends to breed resentment and makes them stay quiet on helpful low-cost improvements.
Instead, get them to focus on splitting apart their "would be nice" feedback from "this must be fixed" feedback.

If you want to implement *any* of these changes effectively you need automation: whether that's CI for the machines or written guidelines for humans.
[I gave a whole talk about this](https://www.youtube.com/watch?v=u3PJaiSpbmc): go watch it!

## A taxonomy of code concerns

Nits are in the eye of the beholder (ow!).
Ultimately it comes down to the question of "what should be blocking".

Let's make the **Leafwing Taxonomy of Code Concerns** (your PMs are more likely to use it if it has a fancy title).
Years of painstaking fieldwork and sample collection have led me to the identification of four categories.

1. **Clear mistakes:** the code doesn't work as intended.
2. **Future work:** there's something cool that's related that we could or should do!
3. **Polish problems:** documentation, formatting, micro-scale code quality problems.
4. **Compromise conflict:** the change sacrifices some desirable property in favor of another one, but the reviewer doesn't agree that it's the right choice.

Which of these should be blocking?

Clear mistakes should be blocking: your code should work, and should have the tests to prove it.
If the reviewer can produce a failing test case, and that test either wouldn't have failed before or wouldn't be more than an hour to fix, the change should be blocked until it's fixed.
When it *can't* be, it evolves into a compromise conflict.

Future work shouldn't block.
Just make a follow-up issue and go talk about it over there to avoid derailing the thread.
If you *can* make your PRs smaller: do.
If you absolutely can't ship a "half-finished" feature to users (you probably can), then put it behind a feature flag and merge the PR anyways rather than exploding its scope.
Merging and moving on maintains momentum and morale.

What about polish problems?
Well, yes and no!
These are definitionally uncontroversial improvements (or sidegrades): why not have more of a good thing?
Better docs will make users happy, and cleaner code will make life better for contributors.
But these aren't *free*: the more time and energy you take in review, the more momentum you sap.

The compromise I suggest is to let the automation guide you.
If a polish problem can be automatically detected, make it blocking.
Then, the author can fix and validate the problem without burning energy on feedback cycles.
But if it can't be automated, focus on maintaining a pretty lenient bar for quality.
Use Github's suggestion feature in your code reviews, or make PRs to their branch, and make it painless for the author to clean things up.
When it comes time to merge: apply any suggestions or clean it up yourself.
Don't let polish nits kill useful features and bug fixes!

Compromise conflicts are where it gets tricky: there *is* no right answer, so it's very easy for discussion to go around in a circle rehashing disagreement until somone burns out and quits the thread or project.
Last woman standing! Very Darwinian, but incredibly wasteful and "how far is each advocate from throwing up their hands" is a poor grounds on which to make technical decisions.

## The lifecycle of controversial changes

When should the fierce flames of conflict be allowed to burn?
We can't always just uncritically accept the first proposal on serious architectural decisions:
we're not *all* game devs in crunch.
Doing so will kill our project with tech debt and force constant rearchitecting to fix the mistakes of the past.
And even [very protracted discussions](https://github.com/bevyengine/rfcs/pull/45) can lead to a much better solution, so concerns *should* be raised!

But interminable debate is a huge risk factor for burnout, which often leads to no solution at all, and can even make trying to tackle the problem again radioactive.
Your objections can be as civil, clear and reasonable as you'd like: keep at it long enough and both the author and everyone who wants this feature will hate you.

So how do we keep these essential conflicts healthy for everyone involved?
I think there's three key elements:

1. Have a process lifecycle for important changes, and don't regress without extremely good reason.
2. Talk clearly about the consequences of each proposal, and how hard it will be to fix mistakes.
3. Cut debate short, and actually decide things.

Considering, designing and implementing controversial changes should be staged ([Niko's proposal is great!](https://smallcultfollowing.com/babysteps/blog/2023/09/18/stability-without-stressing-the-out/)).
It doesn't really matter whether this is formal or informal (just make it clear to contributors).
You need to answer the following questions:

1. Should we do this?
2. How do we do this?
3. Are the details of this solution good enough?

The first question is often the most important: every library and language has an infinite amount of things it *could* do, and the set of things it *maybe should* do is only smaller in a way that only a mathematician could love.
Answering the question of "should we do this" is in my opinion the most important goal of things like [RFC processes](https://rust-lang.github.io/rfcs/).
Build some consensus, come to a decision, and hopefully prioritize your work so that you don't have too many open "we should do this!" ideas floating around at once.

The next stage is where all of the big architectural discussions should take place.
Hash it out on paper, maybe even build some prototypes if needed to test some theories.
Then come together and build something, even if your preferred design didn't win.

Finally, it comes to evaluating the final implementation.
In Rust, this tends to be the stabilization process, but in most projects, this is just PR review.
Here, you should be focusing on clear bugs and polish problems: compromise conflicts are already hashed out and future work has already been written up as you work.

The key thing to learn here is shouldn't go backwards in that process without *very* good reason, especially when a lot of effort has been invested at previous stages: it will waste time, threaten projects and burn people out like a sparkler.
Don't, by way of hypothetical example, pick a fight in a stabilization report (stage 3), after years of implementation work, to argue about whether the feature should exist at all (a stage 1 concern).
It doesn't matter if you think you're right (or even if you *are* right): this is fundamentally damaging to the project and to the team, and that will almost certainly outweigh the delta caused by a bad decision.

## Setting the stakes: consequences and reversability

The tricky part about this is knowing when to draw a close to the first two phases.
When is an idea good enough to try out?
When is a strategic set of compromises good enough to start implementing?

When I think about this, I use two axes:

1. **Impact:** how impactful is this? How many users will this impact? How central is this to what we're building? How visible is this change?
2. **Reverseability:** how hard will it be to fix any mistakes that we make here? Can we just revert the change? Will there be things built on top of it?

At Bevy, these are two of the most important factors involved in [marking a PR as Controversial](https://www.leafwing-studios.com/blog/triage-by-controversy/), forcing a higher standard of review.

Obviously, these are important to consider for maintainers, when deciding whether to merge a PR or move a discussion forward.
But they're really helpful for people in the thick of the process to consider too!
Talk about these things clearly and explicitly when you're writing up your design docs or giving feedback.
It'll help set the stakes, get you taken more seriously, and communicate to the poor author why you're being a pain in the ass.

## Putting it all together

I try to keep my writing positive and light, but for a lot of projects (hi Rust!), I think that this is genuinely their most serious issue.
If you want [stability without stagnation](https://doc.rust-lang.org/book/appendix-07-nightly-rust.html#stability-without-stagnation), to stop burning people out, to actually make progress on big long term goals: you need to fix this.

Here's what you can do:

1. If you're a reviewer who nitpicks: pause and think about the consequences. Make it clear what is blocking, what isn't, and what can be done in follow-up work. Don't stop trying to make things better, but focus on supporting and teaching people.
2. If you're someone *frustrated* by nitpicking reviewers: pick a fight. No, seriously: stop silently sighing and walking away. Publicly say that their concerns shouldn't be blocking, and suggest alternatives that *don't* kill momentum and burn out contributors.
3. If you're [in charge of an organization](https://www.rust-lang.org/governance/teams/leadership-council): empower people to write and publicize better guidelines for both authors and reviewers. But most importantly: have clear decision-making processes, make sure they're adequately resourced, and make sure to build in clear mechanisms by which objections can be overruled.

Do you want help with any of those? Get in touch with me and I'd be happy to give you advice, encouragement and public support for proposed changes that align with this.
