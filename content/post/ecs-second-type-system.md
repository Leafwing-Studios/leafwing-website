+++
title = "ECS as a second type system"
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

As I explored Bevy's ECS more deeply though, I began to notice something intriguing.
In an object-oriented or functional engine, what could happen to my object would be part of their type.
But here, everything was just a vanilla `Entity`.
Each component described what *could* happen to these entities, flowing through the systems that made up my game; while the complete collection of components they had (their **archetype**) determined the total path that they took.

Components store data, but it's almost like they're acting like... *traits*? Now this is an idea worth exploring.
Poking around, I found all *sorts* of interesting parallels, summarized in the table below.

| **Type Concept** | **ECS Concept**     | **Simple Explanation**                                  |
| ---------------- | ------------------- | ------------------------------------------------------- |
| type             | archetype           | What an object *is*.                                    |
| instance         | entity              | A single object of a particular kind.                   |
| field            | component           | The data the object has, organized in a structured way. |
| trait            | marker component    | The behaviors an object is allowed to perform.          |
| method           | system              | Logic that operates on some kinds of objects.           |
| trait objects    | kinded entity       | An object that has a certain set of behavior.           |
| subtyping        | archetype invariant | A guarantee about how types are related.                |

Now, let's crash this grand theory of ours on the rocky shores of cold, hard reality, and see what we can salvage from the wreckage.

## Entity is to Instance as Archetype is to Type

If you've stumbled upon this post, you probably have a *rough* idea of what a **type** is, in the sense used by Rust.
For the brave game designers who have decided to stick with us, a [type](https://doc.rust-lang.org/reference/types.html) describes the data an object has, and what functions can operate on it.
Each object is a single **instance** of a type: the [concrete realization](https://doc.rust-lang.org/book/ch05-01-defining-structs.html) of that platonic ideal, with its own data and identity.

In Bevy, each **archetype** corresponds to a unique set of components, used internally to preserve data locality.
Because components both store data and control behavior, it defines which data entities that belong to that archetype can have, and which systems act on it.
Each entity belongs to exactly one archetype at a time, and has its own unique data in the form of its components.

The parallels are undeniable; if nothing else, this is a great way to teach ECS to programmers.
Our grand theory breezily sails over the perilous reefs; blithely ignoring the deeper questions that our dear readers are beginning to formulate!

## Components act like Traits with data

**Components** are attached to each entity, storing important gameplay data about that particular object.
And so, the quick-witted reader will readily assert that if entities are instances of a type, components represent the **fields** of such a type!
They're organized (named even!) collections of data, each with their own underlying data type.

And indeed, they *do* fulfill that function.
But yet, they are so much more!

Via the magic of the **scheduler**, Bevy's ECS automatically dispatches data to systems as it's needed,
operating on only the entities with the components specified in its **queries**.
THIS MEANS COMPONENTS CONTROL BEHAVIOR AND CONTROL WHICH FUNCTIONS CAN RUN ON IT.
MARKER COMPONENTS ARE THE PLATONIC IDEAL OF THIS, WHERE YOU CONTROL BEHAVIOR WITHOUT DATA.

PROBLEMS WITH TRAITS WITH DATA.

## Duck alchemy

DUCK-TYPING. EACH COLLECTION OF TRAITS RESULTS IN A SINGLE TYPE.

TYPES CAN *CHANGE*.

So, if you think about it in a certain way, our ECS is really just a type system where `transmute` is a first-class feature!

## Systems are functions that are run automatically

SYSTEMS ARE PURE FUNCTIONS.
WHAT THEY ACCESS CONTROLLED BY FUNCTION SIGNATURE.

AUTOMATICALLY RUN BY SCHEDULER, USUALLY REPEATING.
COMMANDS ARE CONCEPTUALLY MUCH CLOSER TO ORDINARY FUNCTIONS.

ONLY OPERATE ON ENTITIES WITH THE CORRECT TRAIT.

## The Proof is in the Predictive Power

ARCHETYPE INVARIANTS DEFINTION.
USEFUL FOR VERIFYING CORRECTNESS, AND ENABLING MORE POWERFUL ECS FEATURES.

A MORE ADVANCED VERSION OF SUBTYPING.

KINDED ENTITES DEFINITION.
KINDED ENTITIES SOLVE THE DYNAMIC TYPE SYSTEM PROBLEM.
TIE IN TO RELATIONS.

TRAIT OBJECTS.
ORDINARY ENTITY DATA BEHAVE LIKE BOX DYN ANY; WE WANT TO CONSTRAIN THAT FURTHER TO ENSURE CORRECT BEHAVIOR.
