+++
title = "ECS as a Second Type System"
description = "If components are like traits..."
tags = [
    "bevy",
    "ECS",
    "rust",
]
date = 2021-01-01 # TODO: Update date
author = "Alice I. Cecile"
+++

If you've hung around the game programming scene, you've heard about the new kid on the block: entity-component-system (ECS) architecture.
Listen to enough curmudgeons, and they'll tell you this is just a hype-ful spin on a very simple idea: use an [array of structs](https://www.reddit.com/r/gamedev/comments/87ikb9/ecs_newb_seeking_clarity/) in place of a struct of arrays in order to improve your cache coherence.
It's a powerful but clunky tool that limits the expressivity of your code, and [should be used narrowly](https://godotengine.org/article/why-isnt-godot-ecs-based-game-engine) for when that performance gain really matters to you.

Certainly, there are no *deeper* implications to this architecture; no compelling reasons to use it when there's no performance bar to meet.
It certainly isn't a [new paradigm](https://ajmmertens.medium.com/ecs-from-tool-to-paradigm-350587cdf216)
for programming, on par with object-oriented or functional programming!

Of course, I think the curmudgeons are wrong.
In my opinion as an enamored user, unashamed promoter, and rather active contributor to [*Bevy*](https://bevyengine.org/), an up-and-coming ECS game engine written in Rust, the design and theory of the ECS paradigm has barely been scratched.

Today's adventure in ECS theory: the ECS as a type system, and the implications for powerful new features.

For those of you who haven't met an ECS before, the [core idea](https://ianjk.com/ecs-in-rust/) is remarkably straightforward.
Objects in your game (or other program) are represented as **entities**, which, on their own store only a simple unique identifier.
We can store data on these objects by adding **components** to them, and then our **systems** operates on entities with the appropriate components (usually once per frame) in order to actually make things happen.
Nice and simple.

As I experimented with Bevy's ECS more deeply though, I began to notice something intriguing.
In an object-oriented or functional engine, what could happen to my object would be part of their type.
But here, everything was just a vanilla `Entity`.
Each component described what *could* happen to these entities, flowing through the systems that made up my game; while the complete collection of components they had (their **archetype**) determined the total path that they took.

It's almost like... components are acting like *traits*? Now this is an idea worth exploring.

| Type Concept  | ECS Concept          | Simple Explanation                                      |
| ------------- | -------------------- | ------------------------------------------------------- |
| type          | archetype            | What an object *is*.                                    |
| instance      | entity               | A single object of a particular kind.                   |
| field         | component            | The data the object has, organized in a structured way. |
| trait         | marker component (?) | The behaviors an object is allowed to perform.          |
| method        | system               | Logic that operates on some kinds of objects.           |
| trait objects | kinded entity        | An object that has a certain set of behavior.           |
| subtyping     | archetype invariant  | A guarantee about how types are related.                |
