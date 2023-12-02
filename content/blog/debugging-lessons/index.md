+++
title = "Lessons from my marathon Rust debugging session"
description = "A methodical approach to squashing bugs for good"
date = 2022-08-02
authors = ["Alice I. Cecile"]

[taxonomies]
tags = ["bevy", "rust", "development philosophy"]
+++

With the [release of Bevy 0.8](https://bevyengine.org/news/bevy-0-8/),
I decided that it was finally time to release the next version of [leafwing-input-manager](https://github.com/leafwing-studios/leafwing-input-manager).
It was going to be great! Support for mouse wheel, gamepad axes, virtual dpads: just crammed with features that users have been asking for since the very beginning.

The [examples](https://github.com/Leafwing-Studios/leafwing-input-manager/tree/main/examples) were behaving as expected,
the [migration to Bevy 0.8](https://github.com/Leafwing-Studios/leafwing-input-manager/pull/170) was painless,
I'd squashed a gnarly [press duration bug](https://github.com/Leafwing-Studios/leafwing-input-manager/issues/127)
and it felt like it was ready to ship.
But, being a good maintainer, I thought: you know what, let's ensure that this all *actually* works,
and write some [tests](https://github.com/Leafwing-Studios/leafwing-input-manager/tree/main/tests).

And that's where my trouble began...

## Lesson 1: Manual verification is no substitute for automated testing

So, support for gamepad axes had been [on my radar](https://github.com/Leafwing-Studios/leafwing-input-manager/issues/50) for a long time.
But suddenly, out of the blue, one of the Bevy community members Zicklag [submitted a PR](https://github.com/Leafwing-Studios/leafwing-input-manager/pull/151) with a working design!

CleanCut (another community member / user!) and I reviewed and refined it, we tested the examples, and everything seemed to be in good working order.
There weren't any automated tests, but it was working for end users, and maybe that was good enough?

The PR was massive already, and my opinion was "you know what, I can fix up any other problems later".
`leafwing-input-manager` is still a small project (well, relative to [bevy](https://github.com/bevyengine/bevy)),
and it's nice to just work through issues and clean up the code without the back-and-forth.

But, of course, while the feature "worked", the supporting input-mocking infrastructure *didn't*.
I want to bring a culture of sophisticated automated testing to the games industry;
I should have made sure that the mocking was working as expected before merging.

## Lesson 2: Don't build on foundations until you're sure they're solid

But, I didn't know that things were broken yet.
In my glee, I quickly wrote and merged support for [mouse wheel](https://github.com/Leafwing-Studios/leafwing-input-manager/pull/173) and [mouse motion](https://github.com/Leafwing-Studios/leafwing-input-manager/pull/186) support, using the same paradigm (and same lack of tests).

The examples worked, the input mocking code seemed straightforward: I was *confident* that adding tests would be a breeze.
Of course, it wasn't.
In this process, I introduced several additional small input-mechanism-specific bugs.
Again: manual verification is no substitute for automated testing.

## Lesson 3: Turn to pair programming when you're frustrated

As if out of nowhere, Bevy 0.8 dropped and my [talk at RustConf 2022](https://rustconf.com/schedule) was fast approaching.
I wrote some tests, and began preparing for release.
But uh, [apparently things were *badly* broken](https://github.com/Leafwing-Studios/leafwing-input-manager/issues/178).

I knew that it had to be on the input-mocking side: manual verification of the features was all working just fine.
I couldn't ship like this, but was overwhelmed and frustrated by the bug.
I *knew* I shouldn't have been so yee-haw about the lack of tests earlier!

I spent a few days ignoring the project, embarrassed and annoyed.
But, swallowing my pride, I decided I should ask for help,
and asked [Brian Merchant](https://github.com/bzm3r) to pair program with me on the bug as a junior.

Having someone to talk to helped soothe my nerves and keep me motivated.
And like always, being forced to *explain* the code base made it clear which parts needed love.

## Lesson 4: cleanup work is a great way to spot bugs

I still didn't have a great sense of what was wrong, so I decided to start cleaning up the related code.
We might stumble across the bug as we worked, but if nothing else,
we'd at least have **something** to show for our time spent debugging.

There's nothing more demoralizing (or wasteful) than an afternoon spent staring at the code with no progress at all.
So, I tackled some tech debt:
handling [gamepad detection more gracefully](https://github.com/Leafwing-Studios/leafwing-input-manager/pull/194/commits/1e39e8b1128a6beca4d04937090f9f481b108acc),
[abstracting over behavior with the MockInputs trait](https://github.com/Leafwing-Studios/leafwing-input-manager/pull/194/commits/626bffea31ce9d0d3b0d534a6c206b0ac3a625a9),
removing an [overengineered robustness strategy](https://github.com/Leafwing-Studios/leafwing-input-manager/pull/193),
and [swapping away from a lazy tuple type](https://github.com/Leafwing-Studios/leafwing-input-manager/pull/197/commits/58dcde6fe283ff16de43fd134ca505ae62257906).

This helped! The code was easier to work with, I had a refreshed mental model of what was going on.

Rather than ending the day in empty-handed frustration, I had several nice fixes to show for my time.
We're definitely getting closer to solving the bug(s).

## Lesson 5: bisect your bug by adding more tests

Tests were still failing though.
So let's think through this.
The basic data model here is:

1. The test tells the app to send a [`UserInput`](https://docs.rs/leafwing-input-manager/latest/leafwing_input_manager/user_input/enum.UserInput.html).
2. This is decomposed into its [`RawInputs`](https://docs.rs/leafwing-input-manager/latest/leafwing_input_manager/user_input/struct.RawInputs.html).
3. These raw inputs are sent as events.
4. The events are processed by Bevy's [`InputPlugin`](https://docs.rs/bevy/latest/bevy/input/struct.InputPlugin.html).
5. The [`InputManagerPlugin`](https://docs.rs/leafwing-input-manager/latest/leafwing_input_manager/plugin/struct.InputManagerPlugin.html) reads the processed [`Input`](https://docs.rs/bevy/latest/bevy/input/struct.Input.html) or [`Axis`](https://docs.rs/bevy/latest/bevy/input/struct.Axis.html) data.
6. This is converted to actions via an [`InputMap`](https://docs.rs/leafwing-input-manager/latest/leafwing_input_manager/input_map/struct.InputMap.html).
7. These actions are checked in the test again in [`ActionState`](https://docs.rs/leafwing-input-manager/latest/leafwing_input_manager/action_state/struct.ActionState.html).

The failure was occurring at step 7, because that's where the assertions are,
but I a) had a robust test suite for core `InputMap` -> `ActionState` path
and b) had proof via manual verification that things were *kinda* working.

1 was trivial to verify by following the code path, so our problem is somewhere in steps 2 or 3.
Well, let's start upstream: garbage in, garbage out at least.

A [couple hundred lines of tests](https://github.com/Leafwing-Studios/leafwing-input-manager/pull/197) later,
and we've found and [squashed a bug](https://github.com/Leafwing-Studios/leafwing-input-manager/pull/200/commits/7b9dd771a09151a044a76a634df0dbc5cd7e3de4) caused by that damn tuple type.
Things are *still* broken, but at least we've narrowed the problem down.

## Lesson 6: make sure the problem isn't with your tests

Oh. Oh. We're [not actually inserting a critical resource](https://github.com/Leafwing-Studios/leafwing-input-manager/pull/200).
Well, that will make it very hard to pass that test.

When something strange is happening, be *sure* to check that the problem isn't in the test itself.
Writing related tests, adding debugging tools, and good old-fashioned manual inspection can go a long way.

Of course, that wasn't the last problem...

## Lesson 7: split your tests to improve debugging

Long tests suck.
While they can reduce the amount of setup boilerplate you need to write and maintain,
they're much less useful for actually debugging.
Tests have two purposes: they should alert you to problems, but they should allow you to quickly isolate causes.
Lumping together long strings of logic makes the latter harder
(especially because Rust stops the test on the first failing assert).

[Splitting my tests](https://github.com/Leafwing-Studios/leafwing-input-manager/pull/207/commits/19abd4239f0778cf79a5267d961cea94e68d5124#diff-0cdbe62a58048a9331d9d362c37f1016923cb1d378034e47029a8c5d5720edf1R486) made it much easier to identify the critical failure.

## Lesson 8: mocking should be as realistic as feasible

Something was going seriously wrong when sending input events.
Let's write [some tests](https://github.com/Leafwing-Studios/leafwing-input-manager/blob/1cfa52fe552d786bb019fac4bd1f6899ba0a661f/tests/mouse_wheel.rs#L67) to verify that these are actually getting sent.

Oh. We're setting the higher-level [`Input`](https://docs.rs/bevy/latest/bevy/input/struct.Input.html) resource
[instead of sending events](https://github.com/Leafwing-Studios/leafwing-input-manager/pull/207/commits/3998834bf6c912596021d920f0b96b2a86a7d5c8).
Well, that's going to be a problem for any users who are looking at the event stream for their game logic.

Let's fix that, and... oh hey, more of our tests are passing!
Mouse wheel and motion tests are all good, but the [equivalent gamepad tests](https://github.com/Leafwing-Studios/leafwing-input-manager/blob/main/tests/gamepad_axis.rs) are broken??

Ah of course, how foolish of me: I'm sending an undocumented [`GamepadEvent`](https://docs.rs/bevy/latest/bevy/input/gamepad/struct.GamepadEvent.html),
not an undocumented [`GamepadEventRaw`](https://docs.rs/bevy/latest/bevy/input/gamepad/struct.GamepadEventRaw.html).
Thank goodness I've looked at the upstream source for that before.

That one gets an [issue](https://github.com/bevyengine/bevy/issues/5544).
And, because the Bevy community rocks, [a PR](https://github.com/bevyengine/bevy/pull/5548) appeared almost immediately.

[Tests are green](https://github.com/Leafwing-Studios/leafwing-input-manager/pull/207), and it's time to ship!
I am so, so happy that that was the last bug.

## Closing thoughts

So, that was "fun".
I can't say I'm pleased with letting that slip in, or the amount of time and frustration that involved, but it could have been much, much worse.

**Things I did wrong:**

- accepting a feature without automated tests
- thinking that manual testing was a substitute
- building on a feature I was suspicious of

**Things I did right:**

- having robust docs and test suite to begin with
- asking for help
- working on targeted incremental improvements
- assuming that there was only one bug ;)

As **vindicating** as it is to see my "take the time to do things right" mentality pay off,
it sure is ironic when *I'm* the one who needs to learn that lesson.
