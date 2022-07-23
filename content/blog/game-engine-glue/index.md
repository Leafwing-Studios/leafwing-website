+++
title = "Game engines are more than libraries glued together"
description = "The value of vision and the cost of external dependencies"
date = 2022-07-22
author = "Alice I. Cecile"

[taxonomies]
tags = ["bevy", "open source"]
+++

{{ blog_image(
   path="blog/game-engine-glue/sponge-bob-meme.jpeg",
   alt="SpongeBob, happy: I'm going to put all these libraries together and make a game engine! SpongeBob, skeletalized: 10 years later..."
) }}

*Meme from the [Twitter post](https://twitter.com/reduzio/status/1550462229484560385) by Juan Linietsky, creator of [Godot], that inspired this blog post.*

When starting a massive technical project (such as, in our case, a [game engine](https://bevyengine.org/)),
the path of least resistance is to take a bunch of working components, glue them all together and then ship it!
What could be easier?

Unfortunately, it seems that empirically this simply doesn't work.
It's not a path to success:
GitHub is littered with failed projects taking this approach
while the most promising up-and-coming game engines ([Godot], [Bevy], [Our Machinery])
eschew this in favor of a much more integrated design.

Why?
The underlying libraries (like [SDL2] or [OpenGL]) may all be great, high quality pieces of software.
In fact, the engines that develop momentum often rely on these same foundational libraries,
and individual game projects (like [Stellaris](https://www.paradoxinteractive.com/games/stellaris/about)) can succeed
by doing precisely the thing I'm arguing you shouldn't do!

So what's the difference?
What *is* a game engine,
and why can't we make one by slapping high-quality libraries together in a sticky, gluey blob?

[Godot]: https://godotengine.org/
[Bevy]: https://bevyengine.org/
[Our Machinery]: https://ourmachinery.com/
[SDL2]: https://www.libsdl.org/
[OpenGL]: https://www.opengl.org/
[Stellaris]: https://www.paradoxinteractive.com/games/stellaris/about

## Game engines are defined by their communities

Let's begin with something controversial:
*a stack made for a single game is not a game engine*.

Even taking the same code base,
and using it for sequential games from the same studio doesn't work the same way.
What [Factorio] did, what [Minecraft] did, what [Quake] did?
Effective, but **not an engine!**

Instead, they made something that could be replaced by a game engine,
but is a qualitatively different product.
As a **single-game-stack**, they have one goal:
make the game they were designed for as effectively as possible.

They don't need to care about:

- **attracting users**
- efficiently teaching those new users
- working on diverse developer hardware
- managing backwards compatibility
- **supporting diverse use cases**

In exchange, they don't benefit from:

- **pooling development resources**, either via licensing revenue or open source contributions
- the architectural battle-hardening won by having to meet those **harsher requirements**
- a **thriving ecosystem** of learning materials, compatible assets and extensions

Engines live and die on the strength of their [communities](https://discord.com/invite/bevy).
Single-game stacks are judged by how quickly, cheaply and effectively they can make the single game they were made for.

Single-game-stacks and game engines are two distinct things, each with their own strengths and challenges.
If you take a technique that works well for single-game-stacks (like gluing together libraries)
and apply it to making game engines,
past performance, as they say, is not a guarantee of future results.

[Factorio]: https://www.factorio.com/
[Minecraft]: https://www.minecraft.net/en-us
[Quake]: https://www.gamedeveloper.com/design/classic-tools-retrospective-tim-sweeney-on-the-first-version-of-the-unreal-editor
[RPGMaker]: https://www.rpgmakerweb.com/
[Twine]: https://twinery.org/

## Dependencies are great, but glue code sucks

Don't get me wrong: libaries rock, and dependencies are Good, Actually.
Bevy has [dozens of them](https://crates.io/crates/bevy/latest/dependencies), both direct and transitive!

Without libraries, your velocity will crawl to a halt,
and just as importantly, you won't be giving back to [the ecosystem](https://arewegameyet.rs/).

The problem here is the dreaded **glue code**:
code that exists solely to get everything to play nice together and talk to each other.
Glue code is brutal to maintain because:

1. It breaks with alarming regularity whenever your dependencies change their major version.
   1. No, don't just never update your dependencies. Bad!
2. It is soul-sucking to write and update.
   1. What, you thought game engine coding was all HDR rainbows and skeletally-animated unicorns?
3. It's painful to test.
   1. I hope you like writing mocks!
4. It makes the cost of switching dependencies incredibly high.
   1. Swapping an integration layer for a complex library is often nearly as much work as writing the code yourself.
   2. Abstractions are lossy, and nothing will make you realize it faster than trying to swap a "quick and easy" integration.
5. Maintaining glue code won't get you promoted, so it'll be [neglected and left to rot](https://rmurphey.com/posts/eng-ladder-glue-work/).
   1. Open source may not care about promotions, but boy do contributors *hate* volunteering for tedious tasks.

If your entire engine is glue code: guess what the vast majority of your work will be.

## Tight cross-org coordination sucks more

It gets so much worse though.
Suppose you *need* that bug fix from your dependency,
or worse, want a shiny new feature to unblock your work?

**Roll a d12** to determine what happens:

1. You open an issue. It's ignored, then closed by [stalebot] after two years.
2. You open an issue, but find that the work is blocked on a rewrite that's been ongoing for the past 18 months.
3. You open an issue, and find that the bug is "working as intended".
4. Your dependency has been abandoned because the solo maintainer burned out.
5. Your dependency has been abandoned because the VC-backed company behind it was accquired.
6. You open a PR, which is promptly closed for failing to follow the coding style guide for the project.
7. You open a PR, and it sits unreviewed.
8. You open a PR, but the maintainer disagrees with your architectural choice. Spend 3 months in review discussions.
9. You open a PR, but another major user says it will break their workflow. Your PR is closed.
10. You try to open a PR, but find that the maintainer only accepts PGP-signed patches via plain text email. You waste two days setting this up.
11. You learn a new language, carefully read the style guide and `CONTRIBUTING.md`, submit a PR, wait 2 months and get the PR merged! You must wait 3 months for the next release.
12. A maintainer takes pity on you and actually just fixes your issue.

Truly, can't you see all the time you're saving?
It's so Agile™!

So **what makes a dependency Good?**

- permissive (or at least compatible) licensing
- contributor-friendly culture
- fast reviews, merges and releases
- high bus factor
- small or unopinionated scope
- far from your core domain-specific logic
- handles a lot of annoying edge cases for you (thanks [`wgpu`] and [`winit`]...)
- aligned with your vision of what the library should be

Unfortunately, if you're just gluing together libraries, you don't get to make that choice.
You can't pick good dependencies or bad ones (except between competitors):
you're stuck with what they give you.

[stalebot]: https://drewdevault.com/2021/10/26/stalebot.html
[`wgpu`]: https://github.com/gfx-rs/wgpu
[`winit`]: https://github.com/rust-windowing/winit

## Game engines need a competitive edge

If you want to make a better game engine than [Unity],
or beat [Unreal] at their own game,
you need a plan.

A real, honest-to-god plan:
none of this "we'll hire the best and work really hard!" pablum.
Trying hard is not a solution,
and it certainly is not a competitive edge.

Similarly, getting off the ground faster is not a competitive edge:
it simply closes the gap between you and the decade of work ahead of you to catch up
with the entrenched, multi-million dollar companies that you're hoping to compete with.

You cannot beat an entrenched competitor by playing their own game,
but catching up faster.
So what makes your engine different?
Who would use it, and why?

Gluing libraries together doesn't help here:
instead, it makes the problem worse.
Every library is opinonated:
you must either write your own, or smooth over the differences.

API design, [data flow], [core philosophy], [programming language]:
you *must* coordinate here, or your engine will be:

- harder to **learn**
- harder to **use**
- harder to **maintain**
- harder to **optimize**

And once you've glued libraries together,
and you've rendered your test scene with blazing fast hyperrealistic shadows and a billion particles,
doing the [second 90%] of the work feels brutal.
You're taking working code,
performing an unending series of cosmetic tweaks to it,
and throwing away all of the advantages you've gained by reusing already working tools.

You're left with two options:

1. **Don't refactor for a unified UX:** Fail to accquire users, struggle to execute any grand vision, watch the tech debt pile higher.
2. **Refactor for a unified UX:** Burn out your team, constantly break your users, frustrate investors with the lack of progress.

Pick your poison.

[Unity]: https://unity.com/
[Unreal]: https://www.unrealengine.com/en-US
[data flow]: https://github.com/bevyengine/bevy/tree/main/crates/bevy_ecs
[core philosophy]: https://ourmachinery.com/post/the-anti-feature-dream/
[programming language]: https://www.rust-lang.org/
[general philosophy]: https://ourmachinery.com/post/the-anti-feature-dream/
[second 90%]: https://en.wikipedia.org/wiki/Ninety%E2%80%93ninety_rule

## Game engines need vision

Ultimately, if you want to make the Next Great Game Engine (I do!),
your project needs a vision that will attract users, investors, toolmakers and contributors.

It needs **features that set it apart**,
**problems it can solve better** than any of the titans,
and a **clear, unified model** that it can teach to users and point at to keep tech debt at bay.

For [Godot], that's a pervasive focus on user-friendliness, the enduring value of open source and the value of a great editor-first workflow.

For [Our Machinery], that's an emphasis on hackability, the importance of performance, and the benefits of being able to build your own tools.

And for [Bevy], that's a belief in [ECS as a general-purpose paradigm], the ease of writing correct code in Rust, and the benefits of a thriving intercompatible ecosystem.

If you want to join us in shaping the future of game development,
you better be able to tell me: **what does that shiny future look like?**

[ECS as a general-purpose paradigm]: https://ajmmertens.medium.com/ecs-from-tool-to-paradigm-350587cdf216
