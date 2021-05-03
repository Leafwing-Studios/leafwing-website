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
3. **No false negatives.** Changes should never be missed by a system.
4. **No false positives.** Every change reported should reflect a real change, with no double counting.
5. **No delays.** We must be able to detect changes that were just made.
6. **Low memory overhead.** We must store this information for each component in the entire game: thousands of entities with dozens of components.
7. **Low compute-cost.** Our change tracker must be must be fast to update and changes must be quick to fetch for each query.

The "reliable" criteria (3, 4 and 5) deserve a bit more attention. This must work:

1. If the change occurred immediately before the detecting system.
2. If the change occurred later in the frame than the detecting system. This results in a frame delay, but shouldn't cause catastrophic failure.
3. If the detecting system runs more than once each frame. This can occur with looping run criteria, commonly in `States`.
4. If the detecting system didn't run for one or more frames.

The final criteria is both devious and shockingly important.
Skipping systems via **run criteria** is a powerful tool for common game functionality, like pausing, swapping between modes using `States`, or having systems that only run every X seconds or frames.

It would be very nice if these systems could take advantage of our change detection as well.
However, that introduces another serious complication: changes could be "seen" by some systems and marked as complete well before they're seen by another system that was skipped.

With that terrible wrinkle in our mind, let's take a look at some simple attempts at a solution.

## Rejected designs

TODO: DerefMut trick, Discuss simple solutions, and evaluate against the criteria

## A no-compromise solution

TODO: discuss ring buffer solution

[The ultimate solution](https://github.com/bevyengine/bevy/pull/1471)

## Closing thoughts

WHAT DOES RELIABLE CHANGE DETECTION ENABLE?

While I helped design solutions, clarify constraints, organize work and review changes, huge amounts of credit belong to the rest of the Bevy team.
In particular:

- [@davier](https://github.com/davier) for doing the huge majority of this implementation work
- [@cart](https://github.com/sponsors/cart) for creating Bevy, writing the intial change detection implementation (including the awesome `DerefMut` trick) and helping us polish the new implementation
- [@bjorn3](https://github.com/bjorn3) and [@jamadazi](https://github.com/jamadazi) for drafting the algorithm we used
- Everyone else who contributed in the [issue](https://github.com/bevyengine/bevy/issues/68) and [PR](https://github.com/bevyengine/bevy/pull/1471) threads for a combined 206 messages!
