+++
title = "So you want to build an ECS-backed GUI framework"
description = "Challenges and opportunities in the future of `bevy_ui`"
date = 2022-11-27
author = "Alice I. Cecile, Rose Peck"

[taxonomies]
tags = ["bevy", "ecs", "ui"]
+++

So you want to build a UI in Rust.
What better tool than an [Enity-Component-System (ECS)](https://en.wikipedia.org/wiki/Entity_component_system) framework to do so?
It's a type-safe, trendy solution for state management and most importantly: it'll be blazing fast (no need for benchmarks obviously).

Well, [Bevy](https://bevyengine.org/) is doing just this! Actually, it has been, for several years.
Why hasn't it dominated the competition, captured the hearts and minds of millions, and obsoleted [areweguiyet.rs](https://areweguiyet.com/)?

While an ECS-based GUI may be unconventional, there's prior art showing it's not *impossible*.
[flecs](https://www.flecs.dev/flecs/) [implements many of the key ideas in this post](https://www.flecs.dev/flecs/md_docs_FlecsScriptTutorial.html) and existing experiments like [`belly`](https://github.com/jkb0o/belly), [`bevy_lunex`](https://github.com/bytestring-net/bevy-lunex), [`bevy_ui_dsl`](https://github.com/Anti-Alias/bevy_ui_dsl), [`cuicui_layout`](https://github.com/nicopap/cuicui_layout) and [`kayak_ui`](https://github.com/StarArawn/kayak_ui) show a ton of promise using Bevy's ECS.
There's even an independent ECS-first GUI library written in Javascript called [Polyphony](https://github.com/traffaillac/traffaillac.github.io/issues/1)!

It turns out, most of the problems that plague [`bevy_ui`](https://docs.rs/bevy_ui/latest/bevy_ui/) *aren't* driven by the decision to use an ECS, or even to use Rust.
They're the boring, tedious and frustrating ones: writing GUI frameworks is a lot of work with many moving parts.
Bugs, boilerplate, and missing features crush the will of both users and devs to actually make things better incrementally.

But before we get too deep in the weeds, an important disclaimer.
Alice is a maintainer of Bevy, but not the project lead or even a UI subject-matter-expert.
Rose is an employee at the [Foresight Spatial Labs](https://www.foresightmining.com/), and uses both Bevy and traditional web frameworks (React) to build GUI-heavy applications for her day job.
**These opinions are purely our own, and are not the final or official word!**

This post aims to record *how* you might make a GUI framework, *why* we're using an ECS at all, and *what* we need to fix to make `bevy_ui` genuinely good.
There's been a lot of reshashed discussion, in [far](https://github.com/bevyengine/bevy/issues/254) [too](https://github.com/bevyengine/bevy/discussions/9538) [many]((https://github.com/bevyengine/bevy/discussions/5604)) [places](https://discord.com/channels/691052431525675048/743663673393938453), but very little tangible movement (except [ickshonpe](https://github.com/bevyengine/bevy/pulls/ickshonpe), you rock).
It's easy to say "`bevy_ui` should work just like my favorite UI framework", but actually turning that into a workable design, getting consensus, and *building* it is much harder.

By writing an up-to-date, comprehensive, low-buzzword document on the requirements, vision and progress, we hope that the Bevy community will be able to come together to fix the problems `bevy_ui` has today, conclusively rule out possibilities and propose solid designs for the critical missing pieces.

And who knows? Maybe it's a decade later and *you're* reading this post, dreaming of writing your own ECS-powered GUI framework.

In my very weary experience, there are three common ways that conversations about `bevy_ui` get derailed:

1. Bevy should just use an existing GUI framework.
2. A single GUI framework that works for both games and applications is impossible.
3. You can't build a GUI framework in the ECS.

## Why not just use `egui`? (or `dioxus` or `tauri` or `iced` or `yew`...?)

There are [a lot](https://blog.logrocket.com/state-of-rust-gui-libraries/) of Rust UI frameworks already.
Some of them are even actively maintained, documented and basically functional!

The community has made [great interop crates](https://github.com/mvlabat/bevy_egui) for some of them, and companies like Foresight have even made [complex production applications](https://github.com/bevyengine/bevy/discussions/5522) using these third-party GUI frameworks.

Bevy trying to write our own must be a critical case of Not Invented Here syndrome.
Why should scarce energy (and decision-making) go towards this,
when we could instead write the upcoming Bevy Editor using an existing solution?
After all, [we could just officially partner with Dioxus](https://github.com/bevyengine/bevy/discussions/9538#discussioncomment-6984809) and skip years of work.

Here's why we think Bevy shouldn't do that, for both technical and social reasons:

1. Consistency with the rest of the engine is valuable in its own right.
   1. It makes for an easier and more consistent learning experience for new users.
   2. It makes the system easier to maintain.
   3. It keeps all the changes in the same repository, eliminating the need for carefully coordinated releases down the dependency tree.
   4. Improvements made to other areas of the engine benefit UI, and vice versa. Cart believes that many of the challenges are not unique to UI, and we agree!
2. Bevy already has a good solution to *many* of the core tasks that a GUI library needs to do.
   1. Rendering, state management, assets, inputs, windowing, async...
   2. Why should we pull in duplicate, subtly incompatible ways to do these tasks?
3. Sending data to and from an external UI framework is inherently error-prone, complex, hard to maintain and heavy on boilerplate.
   1. There's an inescapable floor due to the need for an integration layer and mismatched data models.
   2. This isn't unique to UI: [`bevy_rapier`](https://github.com/dimforge/bevy_rapier) runs into similar problems with physics (although it is still an excellent library).
4. Breaking out of the standard "boxes on a screen" design for UI becomes much harder.
   1. World-space UI is a key feature for games: unit overlays, VR menus, diagetic computer screens...
   2. Game UI [often wants to closely integrate with game world state and have unusual artistic effects](https://forum.unity.com/threads/i-look-forward-to-a-better-ui-system.1156304/).
   3. Writing custom shaders to overwrite the behavior of some nodes is dramatically harder with a third-party solution.
5. None of the existing Rust GUI projects have a great answer to the fact that the borrow checker really hates graphs and really hates split mutability.
   1. With the addition of [relations](https://github.com/bevyengine/bevy/issues/3742), Bevy promises a uniquely powerful approach to dealing with graphs in Rust.
   2. Bevy's systems are a flexible, panic-free, fast, and sound solution for sharing mutable access to world state. There's a lot of black magic under the hood powering this, and dear god do we not want to write it twice.
6. Other projects are not run by the Bevy project.
   1. Our goals may diverge: [`egui`](https://www.egui.rs/) for example is deliberately focused on simple, quick-to-build UIs, and trades off performance and customizability to get that.
   2. Changes become harder to coordinate: migration PRs are needed, and we can't quickly add features needed by the editor.
   3. The upstream crate may become abandoned ([again](https://github.com/vislyhq/stretch/issues/86)). If Bevy is planning to stay around for decades, will the UI solutions be there too?
   4. We can't ensure the quality of one of our critical dependencies.
   5. It puts a lot of maintainership pressure on smaller third-party dependencies to have such a large client making requests of them.
7. Many of the commonly suggested third-party GUI libraries significantly complicate Bevy's build and distribution process, commonly by relying on C, C++, or JavaScript dependencies.
8. Not to be too harsh, but a lot of the existing Rust GUI solutions... just aren't very good.
   1. There's a lot of passable options, but they all have non-trivial drawbacks. No one has really risen to the top as a clear winner.
   2. There's a reason that [areweguiyet.rs](https://areweguiyet.com/) says "the roots aren't deep but the seeds are planted".
   3. Deep down, we all know that we can do better, and we *should*.
9. Users who prefer third-party GUI solutions can and will use them anyways.

Will we learn from other GUI frameworks? Absolutely.
Will we adopt them officially wholesale? Absolutely not.

## One GUI framework to rule them all?

Another common good-faith question in discussion of `bevy_ui` is "can we really meet the needs of all of our users with a single UI framework"?

Some potential splits that I've seen:

- [Application UI vs simple game UI vs complex game UI](https://github.com/bevyengine/bevy/issues/254#issuecomment-886235989)
- [People who love CSS and the web vs those that hate it](https://github.com/bevyengine/bevy/issues/254#issuecomment-850216295)
- [Procedural programmer-friendly GUIs vs asset-driven artist-friendly GUIs](https://github.com/bevyengine/bevy/discussions/9538#discussioncomment-7388170)
- Immediate UI vs retained mode UI

I'm sure you can think of more: schisms are easy and fun!
In theory, we could [pull a Unity](https://forum.unity.com/threads/why-is-unity-creating-yet-another-ui-system.1148585/), and create multiple competing UI frameworks within Bevy.
This would be [very](https://www.reddit.com/r/Unity3D/comments/no6j19/a_unity_rant_from_a_small_studio/) [bad](https://arstechnica.com/information-technology/2014/10/googles-product-strategy-make-two-of-everything/) because:

1. It's very confusing for users.
2. It splits developer attention.
3. Tradeoffs are not always clear to users choosing which solution to use.
4. Migrating between two competing solutions is very painful.
5. Using multiple solutions within the same project is fundamentally untenable.
6. Takes twice as long (if you're lucky).

Fortunately, "navigating the requirements of multiple user groups with distinct needs" is not a problem unique to UI.
We have good tools to manage this at an architectural level:

- This problem is hypothetical and has literally already been solved on the web.
  - We're not going to argue that web UI is the greatest UI solution ever created (it has many flaws, both obvious and not).
  - But people have successfully built virtually any kind of UI you can think of using HTML/CSS/JavaScript: web pages, code editors, games (both in the browser and standalone), CAD applications, terminals, and so on. There's a common joke about how "everything is chrome in the future" (Thanks [Electron](https://www.electronjs.org/))
  - And in case it needs saying, the web UI stack was *not* designed for most of these use cases. Arguably, it wasn't designed for any of them!
- Modularity: ensure that users can take or leave parts of the solution that they don't like.
  - Components, systems, plugins and feature flags are great for this!
  - Third-party UI libraries currently exist, and will continue to exist.
- Extensibility: ensure that internals are accessible and can be built on.
  - Public components and resources are really helpful here.
  - Imagine a rich ecosystem of `bevy_ui` interoperable extension libraries, all of which build on our core rendering, interaction and layout paradigms.
- [Progressive disclosure](https://www.uxpin.com/studio/blog/what-is-progressive-disclosure) in abstraction design.
  - Widgets are built out of nodes.
  - Nodes are just entities.
  - Throughout the process, there's nothing stopping you from hooking in at a lower level.

If users can use the same ECS and rendering tools for everything from pixel art platformers to cell-shaded visual novels to PBR arena shooters,
we can make a UI solution that is flexible and pleasant enough to work for everyone.

## GUI in ECS: How does `bevy_ui` actually work?

With those common objections addressed, we can hopefully talk about how to actually build our UI framework.
Let's think about our actual product requirements, so we can see where `bevy_ui` falls short.

Unfortunately for us, GUI frameworks are wildly complex beasts.
There are several parts that are so essential that their removal cripples the entire system:

1. Storing a tree of nodes
   1. Virtually every non-trivial UI paradigm has one or more nested trees of elements
   2. A "node" is one of these elements: the smallest indivisible atom of UI
   3. You need to store this data somewhere!
   4. In `bevy_ui`, this is stored in the [`World`](https://docs.rs/bevy/0.12.0/bevy/ecs/world/struct.World.html): each node is an entity with the [`Node`](https://docs.rs/bevy/0.12.0/bevy/ui/struct.Node.html) component
   5. UI entities are joined together with using the [`Parent`](https://docs.rs/bevy/0.12.0/bevy/hierarchy/struct.Parent.html) and [`Children`](https://docs.rs/bevy/0.12.0/bevy/hierarchy/struct.Children.html) components
2. Layout
   1. Once you have a collection of nodes, you want to be able to describe where they go on the screen.
   2. Simply specifying absolute size and position is not very robust: it breaks when nodes are added / removed, or when screen size changes.
   3. In `bevy_ui`, this is specified via the [`Style`](https://docs.rs/bevy/0.12.0/bevy/ui/struct.Style.html) component (blame CSS for the name, sorry).
   4. `bevy_ui` uses [`taffy`](https://github.com/dioxuslabs/taffy) (which Alice helps maintain!): it supports [`flexbox`](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) and [`css-grid`](https://css-tricks.com/snippets/css/complete-guide-grid/) layouting strategies
   5. [`morphorm`](https://github.com/vizia/morphorm) is (in our opinion) simply a better choice if you're not tied to Web layout algorithms
3. Input
   1. Collecting user input in the form of keyboard presses, mouse clicks, mouse movement, touchscreen taps, gamepad inputs and so on
   2. Generally paired with "picking": figure out the elements that a pointer event is associated with based on position
   3. Ideally build some nice abstractions for this, to cover things like hovering and pressing, releasing, and long-pressing buttons
   4. `bevy_ui` relies on `bevy_input`, which in turn gets data from [`winit`](https://github.com/rust-windowing/winit) and [`gilrs`](https://docs.rs/gilrs/0.12.0/gilrs/)
4. Text
   1. Converts strings into pixels that we can draw on the screen
   2. Lays out text within the bounds of the node it is contained within
   3. The exact pixels matter for rendering, but the size is important as an input for node layout
   4. `bevy_ui` currently uses [`glyph_brush`](https://crates.io/crates/glyph_brush)
   5. [`cosmic-text`](https://github.com/pop-os/cosmic-text) has much better shaping support for non-Latin scripts
5. Window management
   1. Actually creating a window (or three) to draw your UI in
   2. `bevy` uses [`winit`](https://github.com/rust-windowing/winit), and you should too!
6. Rendering
   1. Taking the elements of your UI, and drawing them to a user's screen
   2. Bevy uses [`bevy_render`](https://docs.rs/bevy_render/0.12.0/bevy_render/) and thus [`wgpu`](https://docs.rs/wgpu/0.12.0/wgpu/index.html) here
   3. If you're building your own Rust GUI framework, check out [`vello`](https://github.com/linebender/vello)!
7. State management
   1. Keeping track of the state of persistent features of your UI
   2. Filled text, radio buttons, animation progress, whether menus are open or closed, dark/light mode, etc.
   3. In `bevy_ui`, state is stored as components on entities (or rarely, as global resources). This works extremely well!
8. Data transfer
    1. Transferring data from the UI to other data stores and vice versa
    2. In the context of Bevy, the "other data store" is the ECS `World` that stores all of your game / app state
    3. Data binding is an abstraction used to automate this process: automatically and granularly transmitting changes
    4. Currently, `bevy_ui` uses systems to send data back and forth from the rest of the `World`

On top of this base, you likely want to add:

1. Navigation
   1. Moving through GUI menus in a prinicipled discretized way: "tab" is the common keybinding for this
   2. Very useful for both keyboards and gamepads
   3. Vital accessibility feature for traditional applications
   4. `bevy_ui` has no first-party solution to this
2. Styling
   1. Widgets and nodes have a ton of mostly-cosmetic properties.
   2. We want to ensure a consistent look and feel across our app, and be able to quickly swap it out.
   3. For applications, (espcially mobile applications) a [*native* look and feel](https://www.quora.com/What-does-native-UI-mean) is very desirable
   4. This might take the form of:
      1. Cascading inheritance (like in CSS)
      2. Selectors (like in CSS, or like you might write in `bevy_ui` using queries)
      3. Global themes like light and dark mode
      4. Widget-specific styles
   5. Styles often need to have predictable rules for composition: what happens when more than one style is affecting an element at once?
   6. `bevy_ui` does not currently have any first-party abstractions for this.
3. An abstraction for composable, reusable widgets
   1. Even simple widget types (radio buttons, text entry box, ) are quite complex!
   2. Users should be able to write these once, then reuse them across their project(s), improving both development speed and UI consistency
   3. Widgets may be composed of one or more nodes/elements
   4. The number of nodes per widget can change dynamically: think about a growing to-do list
   5. Widgets need to be able to take arguments to change their contents or behavior. For example, creating a reusable button with customizable text.
   6. `bevy_ui` currently uses the [`Bundle`](https://docs.rs/bevy/0.12.0/bevy/ecs/bundle/trait.Bundle.html) type for this, but it fails badly because it can't handle multiple nodes
4. Action abstractions
   1. Undo-redo
   2. Rebindable hotkeys
   3. Command palettes
   4. `bevy_ui` has no first-party solution to this, and even third-party solutions are immature (sorry!)
5. Accessibility
   1. Create and expose a machine-friendly API for your UI: reading state, altering rendering/display, sending inputs and detecting what happens when these inputs change
   2. Generally hooks into keyboard navigation
   3. This API is used by tools like screen readers, which present an alternative user interface that meets the needs of disabled users
   4. `bevy_a11y` hooks into [`accesskit`](https://github.com/AccessKit/accesskit), and your GUI framework should too
   5. There's a lot to potentially talk about with accessability that we unfortunately don't have the word count to do here
6. Localization
   1. There is more than one language: you need a way to swap out elements of your UI (especially text) to meet the needs of users who prefer a different language
   2. Some languages are read right-to-left instead of left-to-right, and often certain UI designs will end up backwards if this isn't taken into account
   3. Icons and emoji have different cultural meanings in different places as well
   4. Seriously, just use [`fluent`](https://crates.io/crates/fluent)
7. Asset management
   1. UIs often use prerendered images or icons for visuals, especially in games
   2. You'll want custom decorations and icons, or to show images and videos in their own right
   3. `bevy_ui` uses [`bevy_asset`](https://crates.io/crates/bevy_asset) for this!
8. Animation
   1. Small animations, especially when UI elements change, can dramatically improve the polish and juiciness of a UI
   2. Folding/unfolding context menus, sliding drawers, spinning loading icons, fade-in/fade-out, etc.
   3. `bevy_ui` theoretically integrates with [`bevy_animation`](https://crates.io/crates/bevy_animation) for this, but the integration is unpolished
9. Debug tools
   1. Quickly inspect and modify the UI tree after it has been rendered
   2. This is extremely useful for catching bugs and twiddling styles
   3. `bevy_ui` has no solution for this, but [`bevy_inspector_egui`](https://github.com/jakobhellermann/bevy-inspector-egui) is great
10. UI serialization (in-memory object to file) and deserialization (file to in-memory object)
    1. If we can build our UIs based on a definition stored in a file, we can:
        1. Make it way easier for external tools (like a game editor) to build UIs
        2. Make the UIs easier for end users to customize (think Greasemonkey and game mods)
        3. Makes it easier to build debug tools
        4. Reduce time spent compiling: just hot-reload the asset
        5. Allows full control over the format and syntax used to define objects
        6. Offers the potential for better, modular tooling to create [higher level abstractions](https://github.com/bevyengine/bevy/issues/3877) and automated migrations without modifying source code
    2. In games, this is called a "data-driven" approach
    3. `bevy_ui` currently uses scenes (from [`bevy_scene`](https://docs.rs/bevy_scene/0.12.0/bevy_scene/)) for this
11. Asynchronous tasks
    1. Sometimes, work is triggered by the UI that will take quite a while to complete
    2. You don't want your program to freeze while this happens!
    3. In `bevy_ui`, this uses [`bevy_tasks`](https://docs.rs/bevy_tasks/0.12.0/bevy_tasks/)

## Why does `bevy_ui` suck?

By hooking into Bevy, a fully-featured (but not yet complete) game engine, `bevy_ui` actually has preliminary solutions in most of these domains!

So why is it overwhelmingly viewed as more Bavy than Bevy?
[Having used](https://github.com/bevyengine/bevy/discussions/2235), worked on, and listened to users using `bevy_ui`, here are the key problems, as of Bevy 0.12.
These are loosely ranked in order of subjective impact on user experience.

1. Spawning entities with tons of custom properties requires a lot of boilerplate.
   1. Endless nesting and `..Default::default()` *everywhere*.
   2. This gets so, so much worse [when working with multiple entities arranged in a tree](https://github.com/bevyengine/bevy/blob/v0.12.0/examples/ui/ui.rs). As mentioned, you can't use bundles for this.
   3. A data-driven workflow isn't widely used, because Bevy's scenes are [verbose and inadequately documented](https://github.com/bevyengine/bevy/discussions/9538).
2. Bevy needs a real abstraction for widgets.
   1. Not all widgets can be meaningfully represented as a single entity.
   2. Bevy provides precious few prebuilt widgets: we only have buttons and images.
   3. Because we lack a standardized abstraction, even [adding the simplest, most useful widgets is controversial and gets bogged down](https://github.com/bevyengine/bevy/pull/7116). (To be clear, this isn't the fault of the reviewers or the author.)
3. Using systems in a schedule is not a great fit for data binding.
   1. UI behavior is almost always one-off or very sparse.
   2. Tasks launched from the UI are usually either quite small, or are throwing work into an async pool.
   3. We really want to be able to reference a single, specific entity plus its parent and children.
      1. Getting around this requires the creation of dozens and dozens of marker components: virtually one for every button, text box, image, container, etc.
   4. 99% of the time, these systems will be doing no work. This wastes time, as the schedule must constantly poll to see if anything needs to be done.
4. Managing and traversing hierarchies (both up and down) in `bevy_ecs` really sucks.
   1. [Relations](https://github.com/bevyengine/bevy/issues/3742) can't come soon enough.
5. Bevy's input handling for UI is very primitive.
   1. The [`Interaction`](https://docs.rs/bevy/0.12.0/bevy/ui/enum.Interaction.html) component for dealing with pointer input [is too limited](https://github.com/bevyengine/bevy/issues/7371).
   2. [Multi-touch support](https://github.com/bevyengine/bevy/issues/15) for mobile is [quite limited](https://github.com/bevyengine/bevy/issues/2333).
   3. [Keyboard and gamepad navigation](https://github.com/bevyengine/rfcs/pull/41) is currently missing.
   4. There is no first party support for an [action abstraction](https://github.com/leafwing-studios/leafwing-input-manager) for configurable keybindings.
   5. Bevy's picking support is very simplistic, and isn't easily extended to non-rectangular elements or those in world-space. ([`bevy_mod_picking`](https://crates.io/crates/bevy_mod_picking) please...)
6. Flexbox (and to a much lesser extent CSS Grid) are [hard to learn, have frustrating edge cases, and a terrible API](https://elk.zone/mastodon.gamedev.place/@alice_i_cecile/111349519044271857). Can *you* explain what `flex-basis` does?
7. Font rendering in `bevy_ui` is sometimes remarkably ugly, due to a [just fixed bug](https://github.com/bevyengine/bevy/pull/10537).
8. Bevy is missing a styling abstraction.
   1. Implementation could be done today: just modify components!
9. Adding non-trivial visuals to `bevy_ui` is too hard.
   1. We're missing [rounded corners](https://github.com/bevyengine/bevy/pull/8973): essential for good-looking code-defined UI. (They're currently very fashionable for UI. We *could* just wait a few years for them to go out of fashion, but they'll be back in a few years after that anyway.)
   2. We don't have drop shadows either, but no one cares.
   3. We're missing [nine-patch support](https://github.com/bevyengine/bevy/pull/10588): essential for good-looking but flexible asset-defined UI.
   4. Until Bevy 0.12's UI materials, there was no escape hatch that let you add your own rendering abstractions within `bevy_ui`.
10. Building UIs in pure code or by typing out a scene file can be painful and error-prone: a visual editor would be great.
11. [World-space UI](https://github.com/bevyengine/bevy/issues/5476) is very poorly supported, and uses an [entirely different set of tools](https://github.com/bevyengine/bevy/blob/v0.12.0/examples/2d/text2d.rs).
    1. This is essential for games (healthbars, unit frames), but is also really useful for things like markers and labels in GIS or CAD applications.
12. `bevy_ui` has no first-class animation support.
13. `bevy_ui` nodes all have [`Transform`](https://docs.rs/bevy/0.12.0/bevy/transform/components/struct.Transform.html) and [`GlobalTransform`](https://docs.rs/bevy/0.12.0/bevy/transform/components/struct.GlobalTransform.html) components, but you're not allowed to touch them.
14. The ergonomics of working with async tasks in Bevy is frustrating: too much manual tracking and polling of tasks.

Of these problems, only 1 (entity spawning boilerplate), 2 (widget abstraction), 3 (systems are not a good fit for callbacks) and 4 (hierarchy pain) are caused by our choice to use an ECS architecture.
The rest of these are bog-standard GUI problems: they need to be solved no matter what paradigm you're using.
And critically, *every single one of those ECS-linked problems* is something that Bevy should fix for other use cases:

1. Spawning custom entities (and especially entity assemblages) sucks for ordinary gameplay code, and scenes aren't good enough. For example, spawning a player and all their weapons.
2. Bevy is missing a code-defined level of abstraction that covers multi-entity hierarchies: bundles aren't good enough.
3. One-shot systems are useful for all sorts of bespoke, complex logic, and we need to develop patterns to use them effectively.
4. Bevy's approach to hierarchy is fundamentally slow, brittle and painful to work with. Relations need to be a first-class primitive.

There's no fundamental impedance mismatch or architectural incompatibility beween ECS and GUIs.
`bevy_ui` isn't a fundamentally flawed concept, its ECS foundation [just isn't good enough yet](https://elk.zone/mastodon.gamedev.place/@alice_i_cecile/111349511360164259).

## The path forward for `bevy_ui`

There is a long path to making `bevy_ui` genuinely great, but we can walk it one step at a time.
There are some big open questions still, and upcoming rewrites to core components, but that *doesn't* mean that all of `bevy_ui` is going to be burned to the ground.
GUI frameworks involve a large number of complex, mostly independent subcomponents: improvements in one area will not be invalidated by a rewrite in others!

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
9. Add better examples and functionality for [working with multitouch input](https://github.com/bevyengine/bevy/issues/15) in Bevy.
10. Improve the ergonomics of working with async tasks in Bevy.
11. Add a [Morphorm](https://github.com/DioxusLabs/taffy/issues/308) and/or [`cuicui_layout`](https://cuicui.nicopap.ch/layout/index.html) layout strategy to `taffy`, and expose it in Bevy.
12. Add dozens of widgets (blocked on consensus around a good widget abstraction).

Controversial tasks are ones that we have a clear understanding of and broad agreement on, but have significant architectural implications and tradeoffs:

1. Create a styling abstraction, which works by modifying component values.
   1. Alice wrote a very old [RFC](https://github.com/bevyengine/rfcs/pull/1) for how this might work, [`bevy_kot`](https://github.com/UkoeHB/bevy_kot) has a style cascading approach, and viridia's [`quill`](https://github.com/viridia/quill) experiment has a great proposal too.
2. Upstream [bevy_fluent](https://github.com/kgv/bevy_fluent), taking it under the wings of the Bevy project for long term maintenance.
3. Add support for [keyboard and gamepad navigation](https://github.com/bevyengine/rfcs/pull/41), and integrate it into `bevy_a11y`
4. Add a [proper abstraction for how to handle pointer events and states](https://github.com/bevyengine/bevy/issues/7371).
5. Refine and implement [Cart's `bsn` proposal](https://github.com/bevyengine/bevy/discussions/9538) to improve the usability of scenes.
   1. This is inspired by and closely related to existing work, like [`cuicui`](https://lib.rs/crates/cuicui_layout), [`belly`](https://github.com/jkb0o/belly) and [`polako`](https://github.com/polako-rs/polako).
6. Add an [abstraction like bundles](https://github.com/bevyengine/bevy/issues/2565), but for multi-enitity hierachical assemblages.
   1. Add a `bsn!` macro to make it easier to instantiate Bevy entities and especially entity hierarchies with less boilerplate.
   2. Add a way to generate these from a struct with a derive macro.
   3. Prior art includes [`bevy_proto`](https://docs.rs/bevy_proto/0.12.0/bevy_proto/) and [`moonshine-spawn`](https://crates.io/crates/moonshine-spawn).
7. Add ways to [interpolate colors](https://github.com/bevyengine/bevy/issues/1402) to facilitate UI animation.
8. Create a [UI-specific transform type](https://github.com/bevyengine/bevy/issues/7876) for faster layout and a clearer, more type-safe API.
9. Add support for blending layout strategies in a single tree to `taffy`.
10. Add support for easing/tweening for animations, following [`bevy_easings`](https://github.com/vleue/bevy_easings) and [`bevy_tweening`](https://github.com/djeedai/bevy_tweening).
11. Upstream [`leafwing-input-manager`](https://github.com/leafwing-studios/leafwing-input-manager) to create a keybinding abstraction.
12. Upstream [`bevy_mod_picking`](https://github.com/aevyrie/bevy_mod_picking) to unlock high performance, flexible element selection.
13. Implement [relations](https://github.com/bevyengine/bevy/issues/3742), and use them inside of `bevy_ui`.

Research tasks will require significant design expertise, careful consideration of wildly different proposals and may not have clear requirements:

1. Define and implement a [standard widget abstraction](https://github.com/bevyengine/bevy/discussions/5604). This should be:
   1. Composable: widgets can be combined with other widgets to create a new widget type
   2. Flexible: we should be able to support everything from a button to a list to a tab view using this abstraction
   3. Configurable: users can change important properties of how a widget works without having to make their own type
   4. May map to one Bevy entity or many, in a way that is dynamically updated using ordinary systems
   5. Serializable to and from Bevy scenes
2. Figure out how we want to handle UI behavior (and data binding) to avoid the problems involved with just using systems
   1. This was Alice's original motivation behind creating [one shot systems](https://github.com/bevyengine/bevy/blob/v0.12.0/examples/ecs/one_shot_systems.rs)
   2. [Event bubbling](https://github.com/aevyrie/bevy_eventlistener) and [various](https://github.com/viridia/quill) [sundry](https://github.com/UkoeHB/bevy_kot) and[assorted](https://crates.io/crates/futures-signals) [reactive](https://github.com/aevyrie/bevy_rx) [UI](https://github.com/TheRawMeatball/ui4) experiments seem like interesting potential tools.
   3. [Raph Levien's post on Xilem](https://raphlinus.github.io/rust/gui/2022/05/07/ui-architecture.html) is an interesting read, although not always directly applicable
   4. Data model is the key challenge here: it's very easy to get into trouble with ownership
3. Figure out how to integrate data binding logic into Bevy scenes
   1. The [`Callback` as `Asset` PR](https://github.com/bevyengine/bevy/pull/10711) looks quite promising
   2. [Vultix proposed](https://github.com/bevyengine/bevy/discussions/9538#discussioncomment-7667372) a syntax and strategy for defining this with `.bsn` files.
4. Build the [Bevy Editor](https://github.com/orgs/bevyengine/projects/12), and add support for building GUI scenes using it
   1. There's something of a circular dependency here: the better `bevy_ui` is, the easier this is to build

Obviously, there's a ton of work to be done!
But critically, none of it is *impossible*.
If we (the Bevy developer community) can come together and steadily fix these problems, one at a time, we (Alice and Rose) genuinely think `bevy_ui` will one day live up to the standard for quality, flexibility and ergonomics that we expect out of the rest of the engine.
