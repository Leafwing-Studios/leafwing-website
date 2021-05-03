+++
title = "Reliable change detection in Bevy"
description = "Fast, ergonomic, infallible: pick three"
tags = [
    "bevy",
    "ECS",
    "rust",
]
date = 2021-03-29
author = "Alice I. Cecile"
draft = true
+++

Over the past half-year or so, I've dedicated much of my time to improving [Bevy](https://bevyengine.org/), an ECS-first game engine in Rust.
It's a fantastic (if immature) tool, but one of my favorite things about it is its focus on providing incredibly powerful, ergonomic abstractions to work with.
Today, I want to talk about one of the features I helped build and love using: **reliable change detection**.

For those of you who've never used Bevy before, all of the game logic occurs in **systems**: ordinary Rust functions that are automatically scheduled to run each frame.
These receive their data from the central ECS data store by requesting access to specific data, typically via **queries**, which carefully slice the data and request only the specific data needed.

Here's a quick, complete example of how that looks in practice:

```rust
use bevy::prelude::*;


// TODO: WRITE EXAMPLE
// Text-only
// Spawning system, changes creation

```

As we build out our game, we can combine these systems to spectacular effect, carefully slicing our data and performing elaborate feats of automatically-parallelized behavior-first execution.

By default though, queries fetch data from *all* of the entities with the appropriate components.
This can be quite expensive when we only need to operate on a subset, even if we carefully slice our queries using `With` or `Without` **query filters**.
Most commonly, we only care about the components that have been recently *changed* or *added*: this is where **change detection** comes in.

By adding `Changed<C>` to our query filters, our query will only contain entities whose component of the type `C` has recently changed.
This can be incredibly useful, allowing us to use **reactive** patterns in our code: while our systems may always run, they have minimal overhead and won't be doing wasted work.
`Added<C>` query filters are also handy: they filter for components that were recently added instead, allowing you to automatically handle initialization in a later system.

We can see how this plays out in practice by expanding our example above:

```rust
// TODO: more examples

```

## `DerefMut` magic

Before we dive into the "reliable" part of reliable change detection, lets take a look at our basic building blocks.

In Bevy, components (and resources) are marked as changed if a mutable reference to them has been unpacked, via a [custom implementation](https://github.com/bevyengine/bevy/blob/cf221f9659127427c99d621b76c8085c4860e2ef/crates/bevy_ecs/src/world/pointer.rs#L21) of the `DerefMut` trait on our `Mut` and `ResMut` smart pointers.

This is fantastically clever: it allows us to quickly (and quite reliably) infer which pieces of data have been changed, without relying on caching the value and checking equality.
While this can result in minor false positives (in case a component was mutably accessed but left unchanged), this can be easily avoided through simple and sane code quality.

There are two quirks of this worth calling out:

1. You can manually trigger change detection by manually mutably derefencing a piece of data, such as by calling `component.deref_mut()`.
This is a very high-performance (if somewhat odd) way to flag components as requiring review, and even works on unit struct **marker components** that store no data.
2. Change detection fails to detect changes to data structures made via [interior mutability](https://doc.rust-lang.org/book/ch15-05-interior-mutability.html).
As above, this can either be a feature or a bug, depending on exactly what behavior you're trying to achieve.
If you *really* wanted to, you could even combine these quirks, and call `deref_mut()` each time the data was changed as part of your setter methods to ensure change detection behaves as expected.
Generally though, ECS prefers Plain-Old-Data in its components and resources, so this is unlikely to come up much in practice.

## What does "reliable" mean?

Those paying attention will notice a critical weasel word in my description above: "recently".
This is at the crux of our issue: how long do we track these changes for.

The obvious answer, and the one that Bevy used up to version 0.4 is that "changes persist until the end of the frame".
This is simple, relatively easily implemented and high-performance.

However, it also poses some serious usability problems:

1. If the system that creates the change runs after the system that detects the change the change will be missed.
2. If the system that detects the change doesn't run every frame changes will be lost forever.
3. If the system that detects the change runs multiple times per frame it will repeat work even if there were no new changes to process.
4. If you have a set of systems that both produce changes and detect changes from each other you can create a circular dependency where no possible ordering works!

The last point may seems convoluted and academic, but as your game grows to hundreds of systems, each interacting with each other, the risk of this occurring increases non-linearly.

While these limitations were frustrating, they came to a serious head with the introduction of our [new scheduler](https://github.com/bevyengine/bevy/pull/1144) slated for release in Bevy 0.5.

In pursuit of the valiant goals of eliminating implicit system ordering to reduce fragile bugs and increasing parallelizability of systems,
systems were no longer guaranteed to run in a stable order between runs unless an explicit dependency was given!

This turned these frustrations into a much larger issue: rather than being fiddly, prototyping code (and code that was being migrated) would fail catastrophically and non-deterministically, completely missing changes on some runs of the app but not others.

With our collective hand forced, the community turned its attention on an issue that had been neglected for many months: ["System-order-independent ECS change tracking"](https://github.com/bevyengine/bevy/issues/68).

## A tangled web of constraints

With a clear need, the Bevy team set out in search of a new solution.
However, our constraint set was incredibly tight!
New solutions should be:

1. **Ergonomic.** It must use the same pretty query filter syntax as our existing solution.
2. **Automatic.** It should happen automatically for every component (and resource) type, and occur whenever a change is made.
3. **Low memory overhead.** We must store this information for each component in the entire game: thousands of entities with dozens of components.
4. **Low compute-cost.** Our change tracker must be must be fast to update and changes must be quick to fetch for each query.
5. **No false negatives.** Changes should never be missed by a system.
6. **No false positives.** Every change reported should reflect a real change, with no double counting.
7. **No delays.** We must be able to detect changes that were just made.

Of course, these computational costs (3 and 4) are *relative*, and should not be examined in a vacuum.
Change detection, particularly *reliable* change detection is a powerful tool for avoiding work: if we can skip expensive computations for some entities we can have sizable overhead in our change detection and still come out ahead.
Tools like this must ultimately be benchmarked under *load*, rather than merely measured in terms of naive iteration speed.

The "reliable" criteria (5, 6 and 7) deserve a bit more attention as well. Change detection must work:

1. If the change occurred immediately before the detecting system.
2. If the change occurred later in the frame than the detecting system. This results in a frame delay, but shouldn't cause catastrophic failure.
3. If the detecting system runs more than once each frame. This can occur with looping run criteria, commonly in `States`.
4. If the detecting system didn't run for one or more frames.

The final criteria is both surprisingly devious and important.
Skipping systems via **run criteria** is a powerful tool for common game functionality, like pausing, swapping between modes using `States`, or having systems that only run every X seconds or frames.
It would be very nice if these systems could take advantage of our change detection as well.
However, that introduces another serious complication: changes could be "seen" by some systems and marked as complete well before they're seen by another system that was skipped.

With these constraints in mind, let's take a look at some attempts at a solution.

## Rejected designs

As you may have guessed from the constraint list, this problem is trickier than it first appears.
Let's start with some very simple solutions, and slowly show why they're inadequate.

### Solution 0: Treat everything as changed

We simply throw up our hands and write off the feature.
This is extremely ergonomic, incredibly high performance, and never results in a false negative!
Of course, it fails the false positive criteria completely and must be written off.

### Solution 1: Changes persist until the end of the frame

This was the solution as of Bevy 0.4.
It passes criteria 1-4, as it is ergonomic and performant.
It even passes criteria 7, as changes are immediately marked.

However, as discussed above, this solution fails to be reliable.
Unsurprisingly, it fails criteria 5: false negatives can exist and are quite common, occurring whenever the change detecting system occurs earlier in the frame than the changes are made.

More surprisingly, it also fails criteria 6, presenting false positives!
This occurs whenever a system is run more than once per frame: it will process a change on the first pass, and then find that the same component is still marked as changed on all future passes.
This can have subtle but catastrophic effects if your systems that respond to change are not [idempotent](https://stackoverflow.com/questions/1077412/what-is-an-idempotent-operation), causing changes to be double-counted and overcompensated.

### Solution 2: Changes persist until the end of the frame after they are made, but you can only detect changes in the previous frame

Nice and simple, and we can avoid the ordering problem by only looking backwards.
Just like Solution 1, it passes criteria 1-4.

It has no false negatives (criteria 5), and only has false positives for repeated systems (criteria 6).

However, it fails criteria 7 badly: you must wait an entire frame to respond to changes.
This seriously limits the value of change detection: you must be willing to tolerate delays, and must be *certain* not to have change detection chains that result in noticeable delays.

### Solution 3: Double-buffer changes for two frames

We store changes for two frames (until the end of the frame after they've been made), rotating out each list of changes on each pass.
This "double-buffer" solution is [how events work](https://github.com/bevyengine/bevy/blob/391ccd0ad04d91266e32633c87c5f8adc5524219/crates/bevy_ecs/src/event.rs#L107) by default in Bevy, and in effect, this combines solutions 1 and 2.
Under this proposal, a change would be detected if the component is marked as flagged in either the current frame's buffer or the last frame's buffer.

This is both ergonomic (1) and automatic (2), and comes at a modest performance cost (3 and 4).
It's immediate (7) and eliminates false negatives (5).

However, it's false positive behavior is very bad.
In addition to the repeated systems false positives from Solutions 1 and 2, it triggers a false positive for *every* change-detecting system that runs after a change-causing system on every frame.
This double-counting is a serious performance cost in real applications and, as discussed above, can cause frustrating bugs.

### Solution 4: `JustChanged` and `Changed`

Implement both solutions 1 and 2, but split the behavior to avoid double counting.
Users must filter for either `JustChanged` (solution 1's behavior) or `Changed` (solution 2's behavior) depending on which is more useful for them.

On its face, this is the best of both worlds: you can opt for either immediacy or no false negatives depending on your needs.
Implementation is automatic (2), the performance is fine (3 and 4) and you *can* choose to avoid either false negatives (5) or delays (7).

However, it still suffers from repeated system false positives (6), and, more critically, it's ergonomics (1) are terrible.
Users are forced to confront the gritty details of the scheduler immediately, and choose between two subtly but critically distinct choices.
No matter which solution they pick, they must deal with frustrating and hard-to-debug limitations.

### Solution 5: Per-system change detection

Fed up with this mess, we store one copy of the relevant change detection data in each of our systems, updating it whenever the system is changed.
In effect, this behaves much like event channels, with change events getting sent out to the appropriate systems based on the data they require access to.
Under the hood, this could be done quite easily using a [system-local `Local` resource](https://docs.rs/bevy/0.5.0/bevy/ecs/system/struct.Local.html).

This is ergonomic (1), automatic (2), and perfectly reliable, as we only update this data when the change has been seen.
And, fascinatingly, this is the first solution that handles repeating systems properly, as we're finally able to desynchronize the `Changed` status of each component by system.

However, this is a *large* amount of data duplication, even if we're clever and only store it on the systems that require `Changed<T>` data.
This hurts our performance in unacceptable ways: particularly the memory usage (criteria 3).

## A no-compromise solution

Despite these frustrations, we seem to be successfully stumbling towards a solution.
We've learned that any successful solution must:

1. Report changes immediately (or at least, before anyone else is allowed to look at those changes).
2. Store *some* data on a per-system basis to avoid double counting, especially when working with repeated systems.
3. Avoid naively duplicating all of the change detection data between each of our systems.

TODO: discuss ring buffer solution

[The ultimate solution](https://github.com/bevyengine/bevy/pull/1471)

## Closing thoughts

WHAT DOES RELIABLE CHANGE DETECTION ENABLE?

While I helped design solutions, clarify constraints, organize work and review changes, huge amounts of credit belong to the rest of the Bevy team.
In particular:

- [@davier](https://github.com/davier) for doing the huge majority of this implementation work
- [@cart](https://github.com/sponsors/cart) for creating Bevy, writing the intial change detection implementation (including the awesome `DerefMut` trick) and helping us polish the new implementation
- [@bjorn3](https://github.com/bjorn3) and [@jamadazi](https://github.com/jamadazi) for sketching out the algorithm we used
- Everyone else who contributed in the [issue](https://github.com/bevyengine/bevy/issues/68) and [PR](https://github.com/bevyengine/bevy/pull/1471) threads for a combined 206 messages!
