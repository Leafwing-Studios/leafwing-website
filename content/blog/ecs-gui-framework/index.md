+++
title = "So you want to build an ECS-backed GUI framework"
description = "Challenges and opportunities in the future of `bevy_ui`"
date = 2022-11-26
author = "Alice I. Cecile & Rose Peck"

[taxonomies]
tags = ["bevy", "ecs", "ui"]
+++

So you want to build a UI in Rust.
What better tool than an Enity-Component-System (ECS) framework to do so?
It'll be type-safe, trendy, and most importantly: blazing fast.

In all seriousness Bevy is doing just this! Well, has been, for several years.
Why hasn't it dominated the competition, and obsoleted [areweguiyet.rs](https://areweguiyet.com/)?

Before we get too deep in the weeds, an important disclaimer.
Alice is a maintainer of Bevy, but not the project lead or even a UI subject-matter-expert.
**These opinions are purely our own, and are not the final or official word!**

This post aims to record *how* you might make a GUI framework, *why* we're using an ECS at all, and *what* we need to fix to make `bevy_ui` genuinely good.
There's been a lot of discussion, in far too many places, with far too little clarity.
By writing up a comprehensive document on the requirements, vision and progress, the hope is that the Bevy community will be able to come together to make clear improvements, rule out options and propose solid designs for the critical missing pieces.

And who knows? Maybe a decade from now *you're* reading this post, dreaming of writing your own ECS-powered GUI framework.

## Why not just use `egui` or `dioxus` or `tauri` or `iced` or...?

There are [a lot](https://areweguiyet.com/) of Rust UI frameworks already!
Some of them are even actively maintained, documented and basically useful!

There's [good interop crates](https://github.com/mvlabat/bevy_egui) for some of them, and people have made [complex production applications](https://github.com/bevyengine/bevy/discussions/5522) using them.

Bevy trying to write our own sounds like a severe case of Not Invented Here syndrome.
Why should scarce developer efforts go to this,
blocking critical development on the Bevy Editor?
After all, [we could just officially partner with Dioxus](https://github.com/bevyengine/bevy/discussions/9538#discussioncomment-6984809).

Here's our answer to that, which is both technical and social:

1. Consistency with the rest of the engine is valuable in its own right:
   1. Better learning experience.
   2. Easier maintenance.
   3. Free improvements to performance and usability in both directions. Cart believes that many of the challenges are not unique to UI, and so do we!
   4. Bevy already has a good solution to *many* of these problems, with a good tight integration with the rest of the engine: notably rendering, state management and assets.
2. Sending data to and from an external UI framework is inherently error-prone, complex, hard to maintain and heavy on boilerplate.
   1. While many of these things are true of `bevy_ui` currently, there's an inescapable floor due to the integration.
   2. This isn't unique to UI: `bevy_rapier` runs into the same problems with physics.
3. Breaking out of the standard "boxes on a screen" design for UI becomes much harder.
   1. World-space UI is a key feature for games.
   2. Writing custom shaders to overwrite the behavior of some nodes seems dramatically harder with a third-party solution.
4. None of the existing Rust GUI projects have a great answer to the fact that the borrow checker really hates graphs and split mutability.
   1. Bevy's systems are a flexible, fast, sound and flexbile solution for sharing mutable access to world state.
   2. With the addition of [relations](https://github.com/bevyengine/bevy/issues/3742), Bevy promises a uniquely powerful approach to dealing with graphs in Rust.
5. Other projects are not run by the Bevy project.
   1. Our goals may diverge: [`egui`](https://www.egui.rs/) for example is deliberately focused on simple, quick-to-build UIs, and trades off performance and customizability to get that.
   2. Changes become harder to coordinate: migration PRs are needed, and we can't quickly add features needed by the editor.
   3. The upstream crate may become abandoned (again). If Bevy is planning to stay around for decades, will the UI solutions be there too?
   4. We can't ensure the quality of one of our critical dependencies.
6. There is no single clear winner in this space (unlike rendering or windowing).
7. Users who prefer these solutions can and will use them anyways.

## The making of a GUI

Unfortunately, GUI frameworks are wildly complex beasts.
There are several parts that are so essential that without them, it's hard to argue you have a GUI framework at all:

1. Storing a tree of nodes
   1. Virtually every non-trivial UI paradigm has nested tree of elements
   2. A "node" is one of these elements: the smallest indivisible atom of UI
   3. You need to store this data somewhere
   4. In `bevy_ui`, this is stored in the `World`: each node is an entity with the `Node` component
2. Layout
   1. Once you have a collection of nodes, you want to be able to describe where they go on the screen.
   2. Simply specifying absolute size and position is not very robust: it breaks when nodes are added / removed, or when screen size changes.
   3. In `bevy_ui`, this is specified via the `Style` component (blame CSS for the name, sorry).
   4. `bevy_ui` uses `taffy` (which Alice helps maintain!): it supports `flexbox` and `grid`
   5. `morphorm` is another great choice if you're not tied to Web layout algorithms
3. Input
   1. Collects user input in the form of keyboard presses, mouse clicks, mouse movement, touches, gamepad inputs and so on
   2. Ideally builds some nice abstractions for this, to cover things like hovering and pressing / releasing buttons
   3. `bevy_ui` relies on `bevy_input`, which in turn gets data from `winit` and `gilrs`
4. Text
   1. Converts strings into pixels that we can draw on the screen
   2. Lays out text within the bounds of the node it is contained within
   3. The exact pixels matter for rendering, but the size is important as an input for node layout
   4. `bevy_ui` currently uses `fontbrush`
   5. `cosmic-text` has much better shaping support for non-Latin languages
5. Window management
   1. Actually creating a window (or three) to draw your UI in
   2. `bevy` uses `winit`, and you should too
6. Rendering
   1. Taking the elements of your UI, and drawing them to a user's screen
   2. Bevy uses `bevy_render` and thus `wgpu` here
   3. If you're building your own Rust GUI framework, check out `vello`!
7. Data binding
   1. Transferring data to and from other data stores
   2. In the context of Bevy, this is the ECS `World` that stores all of your game / app state
   3. Currently, `bevy_ui` uses systems to send data back and forth from the `World`
8. State management
   1. Keeping track of the state of persistent features of your UI
   2. Filled text, radio buttons, animation progress and more
   3. In `bevy_ui`, state is stored as components on entities (or rarely, as global resources)

On top of this base, you might want to add:

1. Accessibility
   1. Create a machine-friendly API for your UI: both reading state and sending inputs
   2. This API is used by tools like screen readers, which present an alternative user interface that meets the needs of disabled users
   3. `bevy_a11y` hooks into `accesskit`, and your GUI framework should too
2. Localization
   1. There is more than one language: you need a way to swap out elements of your UI (especially text) to meet the needs of users who prefer a different language
   2. Seriously, just use `fluent`
3. Asset management
   1. The way most UIs look (especially in games!) isn't just defined
   2. You'll want custom decorations and icons, or to show images and videos in their own right
   3. `bevy_ui` uses `bevy_asset` for this!
4. UI serialization (in-memory object to file) and deserialization (file to in-memory object)
   1. If we can build our UIs based on a definition stored in a file, we can:
      1. Make it way easier for external tools (like a game editor) to build UIs
      2. Make the UIs easier for end users to customize (think Greasemonkey and game mods)
      3. Make it easier for designers to contribute to your project
      4. Reduce time spent compiling: just hot-reload the asset
      5. Allows full control over the format and syntax used to define objects
      6. Offers the potential for better, modular tooling to create [higher level abstractions](https://github.com/bevyengine/bevy/issues/3877) and automated migrations without modifying source code
   2. In games, this is called a "data-driven" approach
   3. `bevy_ui` currently uses scenes (from `bevy_scene`) for this
   4. Cart, Bevy's project lead, is working on a [revamp of scenes](https://github.com/bevyengine/bevy/discussions/9538) with the `bsn` file format, targeted at this use case.
5. Styling
   1. Widgets and nodes have a ton of mostly-cosmetic properties.
   2. We want to ensure a consistent feel across our app, and be able to quickly swap it out.
   3. This might take the form of:
      1. Cascading inheritance (like in CSS)
      2. Selectors (like in CSS, or like you might write in `bevy_ui` using queries)
      3. Global themes like light and dark mode
      4. Widget-specific styles
   4. Styles need to have predictable rules for composition: what happens when more than one style is affecting
   5. `bevy_ui` does not currently have any first-party abstractions for this.
6. An abstraction for composable, reusable widgets
   1. Even simple widget types (radio buttons, text entry box, ) are quite complex!
   2. Users shouldn't have to implement them from scratch every time
      1. This is a waste of time
      2. It makes it really hard to keep consistent style or behavior within or between apps
   3. Widgets may be represented by one or more nodes
   4. The number of nodes per widget can change dynamically: think about a growing to-do list
   5. `bevy_ui` currently uses the `Bundle` type for this, but it fails badly

## Why isn't "it's all just entities and systems" good enough?

By hooking into Bevy, a fully-featured game engine, `bevy_ui` actually has preliminary solutions to most of these problems!

So why is it overwhelming viewed as more Bavy than Bevy?
Here are the key problems, as of Bevy 0.12.

1. Spawning entities with tons of custom properties requires a lot of boilerplate.
   1. Endless nesting and `..Default::default()` *everywhere*.
   2. This gets so, so much worse [when working with multiple entities arranged in a tree](https://github.com/bevyengine/bevy/blob/v0.12.0/examples/ui/ui.rs).
   3. A data-driven workflow isn't widely used, because Bevy's scenes are verbose and inadequately documented.
2. Bevy is missing a styling abstraction.
   1. Implementation could be done today: just modify components!
   2. Alice wrote a very old [RFC](https://github.com/bevyengine/rfcs/pull/1) for how this might work, and viridia's [`quill`](https://github.com/viridia/quill) experiment has a great proposal too.
3. Bevy needs a real abstraction for widgets.
   1. Not all widgets can be meaningfully represented as a single entity.
   2. Basic widgets are missing: we only have buttons and images.
   3. Because we lack a standardized abstraction, even adding the simplest, most useful widgets is controversial and gets bogged down.
4. Using systems in a schedule is not a great fit for data binding.
   1. UI behavior is almost always one-off, extremely lightweight tasks.
   2. We really want to be able to reference a single, specific entity plus its parent and children.
      1. Getting around this requires the creation of dozens and dozens of marker components: virtually one for each button.
   3. 99% of the time, these systems will be doing no work. This wastes time, as the schedule must
5. Bevy's input handling for UI is very primitive.
   1. The [`Interaction`](https://docs.rs/bevy/0.12.0/bevy/ui/enum.Interaction.html) component for dealing with pointer input [is too limited](https://github.com/bevyengine/bevy/issues/7371).
   2. Multi-touch support for mobile is quite limited.
   3. [Keyboard and gamepad navigation](https://github.com/bevyengine/rfcs/pull/41) is currently missing.
6. Adding non-trivial visuals to `bevy_ui` is too hard.
   1. We're missing [rounded corners](https://github.com/bevyengine/bevy/pull/8973): essential for good-looking code-defined UI.
   2. We're missing [nine-patch support](https://github.com/bevyengine/bevy/pull/10588): essential for good-looking but flexible asset-defined UI.
   3. Until Bevy 0.12's UI materials, there was no escape hatch that let you add your own rendering abstractions within `bevy_ui`.
7. Font rendering in `bevy_ui` is sometimes remarkably ugly, due to a [just fixed bug](https://github.com/bevyengine/bevy/pull/10537).
8. [World-space UI](https://github.com/bevyengine/bevy/issues/5476) is very poorly supported, and uses an [entirely different set of tools](https://github.com/bevyengine/bevy/blob/v0.12.0/examples/2d/text2d.rs).
   1. This is essential for games (healthbars, unit frames), but is also really useful for things like markers and labels in GIS or CAD applications.
9. Managing and traversing hierarchies (up, down and sideways) in `bevy_ecs` really sucks.
   1. [Relations](https://github.com/bevyengine/bevy/issues/3742) can't come soon enough.
10. `bevy_ui` has no first-class animation support.
11. `bevy_ui` nodes all have `Transform` and `GlobalTransform` components, but you're not allowed to touch them.
12. Building UIs in pure code or by typing out a scene file is painful and error-prone: a visual editor would be great.

Of these problems, 3, 4 and 9 are the most challenging to solve in the context of using an ECS to build a GUI framework.
However, we don't think they're unsolvable!

## The path forward for `bevy_ui`

There is a long path to making `bevy_ui` genuinely great, but we can walk it one step at a time.
There are some big open questions still, and upcoming rewrites, but that *doesn't* mean that all of `bevy_ui` is going to be burnt to the ground.
GUI frameworks involve a large number of complex, mostly independent subcomponents: improvements in one area will not be invalidating by a rewrite in others!

We can split the work to be done into three categories: **straightforward**, **controversial** and **research**.

Straightforward tasks just need to be done.
They may or may not be easy, but there shouldn't be a lot of disagreement on how or if they should be done.
Currently these include:

1. Review and merge [support for rounded corners](https://github.com/bevyengine/bevy/pull/8973).
2. Review and merge [nine-patch support](https://github.com/bevyengine/bevy/pull/10588).
3. Review and merge [Animatable trait for interpolation and blending](https://github.com/bevyengine/bevy/pull/4482).
4. Review and merge the [winit update](https://github.com/bevyengine/bevy/pull/10702), which is likely to fix various small bugs and limitations.
5. Finish, review and merge the [migration to cosmic-text](https://github.com/bevyengine/bevy/pull/10193), which unlocks the use of system fonts and sophisticated font shaping.
6. Add support for [world-space UI](https://github.com/bevyengine/bevy/issues/5476), beginning by reviewing and merging the [Camera-driven UI PR](https://github.com/bevyengine/bevy/pull/10559).
7. Add support for varying [UI opacity](https://github.com/bevyengine/bevy/issues/6956).
8. Add more documentation, examples and tests to `bevy_scene` to make it easier to extend and learn.
9. Add better examples and functionality for working with multitouch input in Bevy.
10. Add dozens of widgets (blocked on a good widget abstraction).

Controversial tasks are ones that we have a clear understanding of and broad agreement on, but have significant architectural implications and tradeoffs:

1. Create a styling abstraction, which works by modifying component values.
2. Upstream [bevy_fluent](https://github.com/kgv/bevy_fluent), taking it under the wings of the Bevy project for long term maintenance.
3. Add support for [keyboard and gamepad navigation](https://github.com/bevyengine/rfcs/pull/41), and integrate it into `bevy_a11y`
4. Add a [proper abstraction for how to handle pointer events and states](https://github.com/bevyengine/bevy/issues/7371)
5. Refine and implement [Cart's `bsn` proposal](https://github.com/bevyengine/bevy/discussions/9538) to improve the usability of scenes
6. Add an [abstraction like bundles](https://github.com/bevyengine/bevy/issues/2565), but for multi-enitity hierachical assemblages
   1. Add a `bsn!` macro to make it easier to instantiate Bevy entities and especially entity hierarchies with less boilerplate
   2. Add a way to generate these from a struct with a derive macro
   3. Prior art includes [`bevy_proto`](https://docs.rs/bevy_proto/latest/bevy_proto/) and [moonshine-spawn](https://crates.io/crates/moonshine-spawn)
7. Add ways to [interpolate colors](https://github.com/bevyengine/bevy/issues/1402), to facilitate UI animation
8. Create a [UI-specific transform type](https://github.com/bevyengine/bevy/issues/7876) for faster layout and a clearer, more type-safe API
9. Implement [relations](https://github.com/bevyengine/bevy/issues/3742), and use them inside of `bevy_ui`

Research tasks are areas that will require significant design expertise, and may not have clear requirements:

1. Define a standard widget abstraction. This should be:
   1. composable
   2. flexible
   3. May map to one Bevy entity or many, in a way that is dynamically updated using ordinary systems
   4. Serializable to and from Bevy scenes
2. figure out how we want to handle UI behavior and data binding to avoid the problems involved with just using systems
   1. Callbacks, event-bubbling and various reactive UI experiments are all promising
3. Figure out how to integrate data binding logic into Bevy scenes
   1. The [`Callback` as `Asset` PR is quite promising here](https://github.com/bevyengine/bevy/pull/10711)
4. Build the Bevy Editor, and add support for building GUI scenes using it

Easy!
