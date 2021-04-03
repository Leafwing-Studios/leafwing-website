+++
title = "Static analysis for game design"
description = "Playtesting is overrated"
tags = [
	"game-design",
	"static-analysis"
]
date = 2021-03-30 #TODO: Update date
author = "Alice I. Cecile & Rose Peck"
draft = false
+++

Spend enough time in certain game design circles, and you'll encounter the belief that playtesting is the best (or *only*) tool for game design.
This mindset leads to some common (although not universally held!) sentiments:

* Only by playing the game, and experiencing it as a player would, can we truly understand our game, identify its problems, and develop new solutions.
* Without a working game (or high-fidelity prototype), any design work and iteration is wasted: almost certain to be thrown away and prone to endless decision paralysis due to lack of data.
* The only way to catch bugs or meaningful balance issues is by playing the game.
* "Fun" is truly ineffable: it can only be measured in the final, holistic experience.
* The only sensible way to make a game is to start with something that you know already works.

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
By focusing on building powerful, reusable tools, you can create a common vocabulary and process for your team.
Some of our favorite tools at *Leafwing Studios* are:

* **Strong design goals:** Carefully think through what you're trying to do, and then refer back to your goals regularly. Ask if the current rules and options match your goals.
* **Systems analysis:** What are your feedback loops? Where are the interesting choices? What tensions exist? Is every choice meaningful?
* **Complexity budgeting:** Every new system and feature comes with a cost to your players; there is only so much they can understand and remember at once. Make sure you've spent your budget wisely. Complexity is much more expensive at **run-time** (during active gameplay) than at **compile-time** (during planning).
* **Tuning levers:** Knobs that are both trivial to adjust after the system has been built and influence the system's balance or feel. For example, the amount of damage a particular weapon does.
* **Balance frameworks:** Use consistent units of power and establish conversion rates between those units of power. Separate power budgets by type to avoid entanglement. Avoid unnecessary granularity.
* **Regression testing:** Record your design's failures (or those of similar games), and check to make sure you've fixed or avoided them.

The following game development and design patterns can help make static analysis easier:

* **Keywording:** Give unique names to your mechanics, statuses, moves etc. This makes it easier to reuse, tune, and reference these building blocks across your game.
* **Proposals:** When working on complex changes to design, separate them into proposal documents, which talk about changes and justification for those changes.  Proposals make it much easier to do...
* **Design reviews:** Have other members of the team review and critique each other's designs. The sooner you do this, the less work you'll waste.

This is just a quick overview; follow along ([email list](TODO: link), [RSS](TODO: link)) if you want to keep an eye out for more detailed blog posts on these topics.

With effective use of these strategies, you can learn a lot about your games and its systems without ever having to make the full investment of playtesting.
You can work on paper, dodging difficult polish requirements because no one outside of your team has to touch what you've made to learn about it.
Static analysis loves to analyze games that have been stripped of their details and fluff, which makes it great for spotting high-level design flaws that cut across multiple core systems.

## Focused tests

Once you've identified some particularly gnarly design problems, it's time to test out some potential approaches.
While static analysis can get you far, sometimes you need to see how something *runs*, to determine if it fits your goals.
**Focused tests** should be your first choice for this.
They should be narrow, lightweight, and have clear success / failure criteria.
In software, these would correspond to **unit tests**.

When designing your focused tests, it can be helpful to:

* Limit your scope to the elements that are core to the problem at hand
* Create [**mock-ups**](TODO: add link) for an interlocking systems that can't be ignored
* Use fast tools for making prototypes (pure design, pen-and-paper, board games, game making tools)
* Ignore polish
* Throw away your prototypes
* Define clear [**user stories**](TODO: add link) for how the feature will be used
* Design [**test cases**](TODO: add link) adversarially: try to develop diverse situations that maximize the likelihood that the system will fail. This helps catch potential issues and edge cases.
* Write down clear success and failure criteria

By narrowing the focus of your testing, you can save time on making prototypes, catch tricky edge cases, clearly define the problem you're trying to solve, and collectively decide whether a problem has been "fixed".

## Classical playtesting

In software, the classical approach to playtesting would be called **integration testing.**
Testing your game from end-to-end, as if you were a player, can be great for catching unexpected problems, but comes with several very serious drawbacks:

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

In the end, classical playtesting can still be fun, informative, and highly effective, particularly for learning about subjective player experience, and performing holistic evaluation.
But, as we hope we've convinced you in this blog post, it's only one tool in your toolbox.
Use static analysis first to identify problems, hammer them out with focused tests and then use classical playtesting to refine feel and catch unforeseen issues.
By doing this, you can catch mistakes early and guide your designs much more intentionally.
As you sharpen these analysis skills, you'll eventually be able to accept, reject, and critique whole systems by inspection alone.
