+++
title = "Static analysis for game design"
description = "Playtesting is overrated"
tags = [
	"game-design",
	"static-analysis"
]
date = 2021-03-30 #TODO: Update date
author = "Alice I. Cecile & Rose Peck"
draft = true
+++

Spend enough time in certain game design circles, and you'll encounter the belief that playtesting is the best (or *only*) tool for game design.
This mindset leads to some common (although not universally held!) sentiments:

* Only by playing the game, and experiencing it as a player would, can we truly understand our game, identify its problems, and develop new solutions.
* Without a working game (or high-fidelity prototype) iterating on design is futile: almost certain to be thrown away and prone to endless decision paralysis due to lack of data.
* The only way to catch design flaws or balance issues is by playing the game.
* "Fun" is truly ineffable: it can only be measured in the final, holistic experience of the player.

Now that our men of straw have been constructed, let's knock them down.
At its heart, these ideas stem from a failure to develop other methods for analyzing design and catching mistakes.
Luckily, there is a better way.
The conceptual framework that we use to address this borrows aggressively from software: you need a range of approaches for testing your game.
Many of the methods we will talk about are well-known and well tested in the world of software design (and classical engineering), but we've rarely seen them applied to game design and development.

We typically find it helpful to think of tests in three levels: **static analysis, focused testing, and classical playtesting.**
As you move up in levels, the cost increases dramatically, but you also get better at catching **unknown unknowns** (problems that you didn't see coming).

## Static analysis

**Static analysis** is the process of determining the properties of and potential issues with a design, just by inspection.
In software, this corresponds to a **compiler.**
If you've never done this before, this may seem like wishful thinking, or perhaps a vague gut feeling reserved only for the most seasoned designers.
However, by focusing on building powerful, reusable tools, you can create a common vocabulary and process for your team.

Static analysis loves to analyze games that have been stripped of their details and fluff, which makes it great for spotting high-level design flaws that cut across multiple core systems.
You can work on paper, dodging difficult polish requirements since you never need to show your static analysis to players.
Some of our favorite tools for this at *Leafwing Studios* are:

* **Strong design goals:** Carefully think through what you're trying to accomplish, and then refer back to your goals regularly. Ask if the current rules and options match your goals.
* **System breakdown:** What are your feedback loops? Where are the interesting choices? What tensions exist? Is every choice meaningful? Do actions lead to tangible consequences?
* **Complexity budgeting:** Every new system and feature comes with a cost to your players; there is only so much they can understand and remember at once before the [complexity](https://medium.com/@wp/depth-vs-complexity-in-game-design-7e687d5f6f1f) of the system overwhelms them. How are you spending your budget? What pieces are eating a lot of complexity?
* **Tuning levers:** Identify (and build!) knobs that are 1. trivial to adjust after the system has been built and 2. influence the system's balance or feel. For example, the amount of damage a particular weapon does is a common tuning lever.
* **Balance frameworks:** Use consistent units of power and establish conversion rates between those units of power. Separate power budgets by type to avoid entanglement. Avoid unnecessary granularity.
* **Regression testing:** Record your design's failures (or the failures of similar games), and check to make sure you've fixed or avoided them.

The following game development and design patterns can help support your static analysis and make it easier:

* **Keywording:** Give unique names to your mechanics, statuses, moves etc. This makes it easier to reuse, tune, and reference these building blocks across your game.
* **Write proposals:** When working on complex changes to design, separate them into proposal documents, writing out your changes and your justification for those changes.  Proposals help you refine your ideas, avoid circular arguments, and examine why decisions were made.
* **Design reviews:** Have other members of the team review and critique each other's designs. The sooner you do this, the less work you'll waste.

Each of these strategies is a topic worth discussing in depth; keep an eye out ([email list](/mailing-list), [RSS](TODO: link)) for new posts.
With effective use of these strategies, you can learn a lot about your games and their systems without ever having to make the full investment of playtesting.

## Focus tests

Once you've identified some particularly gnarly design problems, it's time to test out some potential approaches.
While static analysis can get you far, sometimes you need to see how something *runs*, to determine if it fits your goals.
**Focus tests** should be your first choice for this: targeted scenarios that you (and perhaps another designer or two) can experiment with to answer questions empirically.
In software, these would correspond to **unit tests**.

When designing these tests, it can be helpful to:

* **Limit your scope** to the elements that are core to the problem at hand
* Use **lightweight tools** with minimal overhead whenever you can (pen-and-paper > board games > code prototypes)
* Write down **clear success and failure criteria**. How can you measure the system's success? What are you worried might happen?
* [**Mock**](https://circleci.com/blog/how-to-test-software-part-i-mocking-stubbing-and-contract-testing/) **inputs and reactions** from other systems that can't be disentangled
* Focus your prototypes on **exploration over cleanliness or quality.** Don't be afraid to break things in your test environment!
* Reuse prototypes for future tests, but **don't plan to build your game out of prototypes**
* **Focus on typical play patterns,** and optimize the user experience for those cases
* Once the common case works, consider the edge cases. **Design your test cases adversarially:** try to develop diverse situations that maximize the likelihood that the system will fail. This helps catch potential issues and edge cases.

By narrowing the focus of your testing, you can save time on making prototypes, catch tricky edge cases, clearly define the problem you're trying to solve, and collectively decide whether a problem has been "fixed".

## Classical playtesting

In software, the classical approach to playtesting would be called **integration testing.**
Testing your game from end-to-end, as if you were a player, can be great for catching unexpected problems, but comes with some serious drawbacks:

* Impossible to conduct without a reasonably complete prototype
* Difficult to focus on a specific pieces of the game's design
* Time consuming
* New vs experienced player experience is very distinct
* Players often do not accurately report subjective experience
* Players often come not with problems found or observations, but with proposed solutions (which are often hard to disentangle)
* Players are good at catching outwardly noticeable problems (such as confusion around a mechanic), but not finding deeper, systemic issues (such as poorly spent complexity)

As a result, classical playtesting should often be considered as either a last resort, or as a "finishing pass" on a design you've already analyzed on it's own.
This is particularly easy and effective if you have good tuning levers to work with, allowing your classical playtest to focus on nailing those values and improving game feel.

## Conclusion

In the end, classical playtesting can still be fun, informative, and highly effective.
It is particularly valuable for learning about subjective player experience and performing holistic evaluation.
But, as we hope we've convinced you in this blog post, it's only one tool in your toolbox.
Start with static analysis to identify problems, hammer them out with focused tests and then use classical playtesting to refine feel and catch unforeseen issues.
By doing this, you can catch mistakes early and guide your designs much more intentionally.

Sharpening these analysis skills has made us better designers, and we're excited to share the details of what we've learned in future blog posts.
In the mean time, we'd love to hear about your experiences with this style of design.
Feel free to [get in touch with us](../about.md); we'd love to hear what worked for you, what didn't, what changes you made and what tools you've invented!
