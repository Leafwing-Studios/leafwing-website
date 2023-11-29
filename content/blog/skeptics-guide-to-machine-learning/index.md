+++
title = "A skeptic's guide to AI-powered products"
description = "Delivering value in the face of hype"
date = 2023-10-03
authors = ["Alice I. Cecile"]

[taxonomies]
tags = ["machine learning", "game design", "business"]
+++

So, you want to do a machine learning.
You're not totally sure what that means, but everyone's talking about it!
You saw some [cool](https://chat.openai.com/auth/login) [demos](https://stablediffusionweb.com/) of large language models, image generation or some other shiny tech that's debuted 5 years from when this post was written.

Unlike [blockchain](https://web3isgoinggreat.com/), AI is definitely the future: we're not sure how, but it's going to revolutionize society.
Your company *can't* be left behind.

Unfortunately, you work at a company that makes video games. Or meeting software. Or does consumer banking.
You don't have any clue how to actually build "an AI" or how to integrate it into your product in a way that actually makes it better.

Fortunately for you, machine learning experts at Google have developed an [excellent set of guidelines](https://developers.google.com/machine-learning/guides/rules-of-ml) that anyone can understand.
The most important of these is sometimes called "the first law of machine learning", and it is very simple:
**don't do machine learning.**

## You're still here?

Unfortunately, if you're still reading this post, you don't have the power to change this decree.
Or maybe you weren't convinced, and *really* want to do machine learning anyways.

Okay, cool.
We can work with that.
It may be a dumb, counterproductive choice that distracts you from solving the real problems your company is facing, but ultimately, **constraints breed creativity.**

And despite the cynical tone, machine learning is genuinely wonderful and terrible.
I love it and think it can be used in a lot of incredible ways.
Some of which might even make you money!

## Machine learning fundamentals

If you've never been exposed to the [fundamentals of machine learning](https://hastie.su.domains/Papers/ESLII.pdf) before, there are only three key technical lessons you need to know as a PM for a machine learning team:

1. **Machine learning is trained on data,** and reproduces the patterns in that data.
2. There are four core ways to use machine learning: **prediction**, **causal inference**, **generation** and **reinforcement learning.**
3. Machine learning is **expensive and unreliable**: only use it when you have no other choice!

All of that stuff about the relative performance of [models with names from the Muppets](https://www.theverge.com/2019/12/11/20993407/ai-language-models-muppets-sesame-street-muppetware-elmo-bert-ernie), [deep learning architectures](https://journalofbigdata.springeropen.com/articles/10.1186/s40537-021-00444-8), [federated learning](https://blog.research.google/2017/04/federated-learning-collaborative.html), [representation learning](https://paperswithcode.com/task/representation-learning), [Wasserstein metrics](https://en.wikipedia.org/wiki/Wasserstein_metric) and dozens of other impressive sounding technical terms?
Really cool, but most of it doesn't matter to you: focus on the fundamentals and you'll be able to ask your engineers the questions that matter.

## Machine learning models are trained on data

Unsurprisingly, there are no little men [trapped in a box](https://en.wikipedia.org/wiki/Mechanical_Turk) drawing anime girls, making up weird factoids and writing cold intros for recruiters.
You probably know that there's a lot of math and computers involved, but how *do* they work?

Ultimately, machine learning models (aka AI, aka statistics for computer scientists) are trained on data.
They ingest data points (hundreds or thousands or billions of them), use fancy math, and **capture the patterns** that are contained in them.
This has a few implications:

1. You need good data to make a succesful machine learning product.
   1. It should be [clean](https://www.tableau.com/learn/articles/what-is-data-cleaning): free of obvious errors. This process sucks, a lot.
   2. It should reflect the conditions you actually care about: [outdated and unrepresentative data is much less useful](https://machinelearningmastery.com/gentle-introduction-concept-drift-machine-learning/).
   3. You need [enough data](https://www.sciencedirect.com/science/article/abs/pii/S1755534518300058) to actually get meaningful results.
   4. The data must actually contain the relationship you're looking for: otherwise you're just [lying to yourself and your customers](https://gizmodo.com/predictive-policing-cops-law-enforcement-predpol-1850893951).
2. Your model will reproduce any [biases](https://www.isaca.org/resources/isaca-journal/issues/2022/volume-4/bias-and-ethical-concerns-in-machine-learning) in that data.
   1. This might cause legal headaches and public outrage: discrimination is bad, even if it's done by a machine.
   2. As [IBM said in 1979](https://twitter.com/SwiftOnSecurity/status/1385565737167724545?lang=en): a computer can never be held accountable; therefore a computer must never make a management decision.
3. If you are using generative models to create new samples that look like your inputs, these are fundamentally based on your training data.
   1. This might cause [legal problems](https://www.reuters.com/technology/more-writers-sue-openai-copyright-infringement-over-ai-training-2023-09-11/), so consider [actually licensing your training data](https://www.reuters.com/technology/adobe-nvidia-ai-imagery-systems-aim-resolve-copyright-questions-2023-03-21/).
   2. It will probably also make people [very mad](https://www.vice.com/en/article/ake9me/artists-are-revolt-against-ai-art-on-artstation), due to the whole "wanting to be able to earn a living" thing. Maybe consider the ethical and PR implications?

## What can I do with machine learning?

Alright, so you have some data, and a directive to "do machine learning".
What might you possibly accomplish?
Let's go over the broad possibilities:

1. **Prediction:** estimate or predict a quantity, based on other cheaper or earlier data.
   1. Great for predicting prices, fraud detection, building recommender systems, or helping a [missile know where it is](https://www.youtube.com/watch?v=6iBeRfOAAwk).
   2. Can be used to create [features](https://en.wikipedia.org/wiki/Feature_(machine_learning)) like [a list of objects in images](https://en.wikipedia.org/wiki/Computer_vision) or [sentiment analysis](https://en.wikipedia.org/wiki/Sentiment_analysis), to use in other products.
   3. Straightforward and effective! If you have the right data.
2. **Causal inference:** understand how a system works, and use that to inform your decisions.
   1. A/B testing (and more) to determine what changes will be effective.
   2. Understanding your business, and figuring out how it works.
   3. Traditionally the domain of statistics: use traditional methods when you can!
   4. Go in with an open mind, and try very hard not to lie to yourself.
   5. Very hard to automatically scale: generally the impact will be in shaping decisions that you make and act on.
3. **Generation:** create more samples that look like your training data, but different.
   1. This is the current wave of LLM and image generation and voice cloning hype.
   2. Summarize documents! Make art! Or voices! Or reams of eerily quasi-accurate text!
   3. Metrics for "what does success look like" are often much squishier.
   4. Generally requires a ton of data and expensive computation.
4. **Reinforcement learning:** create an agent that learns and responds to a challenging or dynamic environment.
   1. Shows promise in robotics: environments are exceedingly complex, and robots might need to respond to new things dynamically.
   2. This can be used to identify promising new experiments to run, such as in material science or pharmaceuticals.
   3. Once you have a specific [policy](https://www.baeldung.com/cs/ml-policy-reinforcement-learning) to solve a challenging task, you can just freeze it and use it in production, reducing cost and improving reliability.

Machine learning can do a lot of things!
But it's not magic, and [the combination of some data and an aching desire for a sweet machine learning product does not guarantee business success](https://www.azquotes.com/quote/603406).

## Machine learning sucks

So, why does that first law of machine learning exist?
If machine learning is so powerful and flexible, why shouldn't we jam it in all of our products and ride the hype train straight to the future?

Well, let me prepare a short and non-exhaustive list:

1. Machine learning models can behave in **unpredictable** ways.
2. ML solutions are often much **harder to understand** than an equivalent statistical or hard-coded solution.
3. **A cheap, simple solution is often good enough.**
4. Machine learning requires **good data**, which you often won't have.
5. Hiring machine learning experts is **expensive.**
6. Training machine learning models is **time consuming** and expensive.
7. Deploying machine learning models in production is **complicated** and flaky.

 Seriously: these aren't new or controversial problems.
 If you want to make a good product, machine learning should be a last resort, sprinkled in carefully to achieve things no other technique can do.

 But more optimisticly, there's a whole range of possible approaches you can take, to slowly test out the technology in a lower risk way.

 1. Just build a simple baseline solution, that doesn't use AI.
 2. Use an interpretable statistical model. Anything from linear regression to generalized additive models works great here.
 3. Augment your baseline solution with machine learning, by applying corrections to its predictions or outputs.
 4. Use a powerful but simple machine learning technique to solve your problem, like [gradient-boosted decision trees](https://developers.google.com/machine-learning/decision-forests/intro-to-gbdt).
 5. Use pre-trained fancy models to do [feature extraction](https://deepai.org/machine-learning-glossary-and-terms/feature-extraction) on your images, text or other weird data, and then pass it into simpler [tabular data](https://sebastianraschka.com/blog/2022/deep-learning-for-tabular-data.html) learning algorithms.
 6. Take an existing [foundation model](https://aws.amazon.com/what-is/foundation-models/#) in your domain, and then [fine-tune](https://en.wikipedia.org/wiki/Fine-tuning_(deep_learning)) it on your own data.
 7. Take an existing model architecture, and then train it on your own data.
 8. Invent a new model architecture, validate that it works on a [standard benchmark](https://biodatamining.biomedcentral.com/articles/10.1186/s13040-017-0154-4) or three, and then train it on your own data.

Realistically, most problems only require level 1 or 2.
But, if you use anything beyond level 2, you can honestly (grading on a curve, okay?) claim that your product is "made with AI" and "ML-powered"!
The lower on this scale you stay, the easier, cheaper, faster and lower risk your project will be.
Sure, you could probably squeeze out another 1% of performance by playing with bleeding edge model architectures.
But is that really the thing that will help your business most?

Despite the mystique and prestige, adding machine learning to your business **doesn't require hiring PhDs in machine learning.**
At level 1 through to level 4, any reasonably competent software engineer with a bit of humility and a head for numbers can tackle this.
At level 5 through 7, probably find someone with experience in machine learning and prepare to invest in infrastructure to make sure their experiments can actually be deployed.
Only at level 8 are you fundamentally doing novel research.
Unless you are operating at a truly massive scale, or machine learning is your business's key competitive advantage, don't waste your time doing that!

## But what *should* I do with machine learning?

With your feet planted firmly in reality, it's time to use your head and decide how to actually apply machine learning to your business.
Even if you know what it *can* do, there's an art to figuring out where it should be used.

Fortunately, this isn't a unique problem.
Focus on your users, and what they actually want and need.
No, not your CEO, who's spitting a new fad-of-the-month AI idea at you.
The people who actually pay you money, because you make a thing that makes their life better.

Go back to the fundamentals:

1. What are your users trying to do?
2. Where is our product the weakest?
3. What is our vision for the thing that we're selling?

These are the things you should be focusing your time on, AI or not.
The problems that are particularly suited to machine learning will:

1. Have a clear measurement of what a "successful" business outcome looks like.
2. Have lots of high-quality data.
3. Not already have a good solution using traditional approach.
4. Be okay with some mistakes, either due to low-stakes or manual overrides.

No matter how hyped AI might (or [might not](https://en.wikipedia.org/wiki/AI_winter)) be, I genuinely believe that there's real value in the technology.
But ultimately, I don't think that most of the competetive edge comes from raw technological prowess: bigger models, better benchmarks, cheaper inference.
Instead, like always in business, it comes down to picking the right problem and building what your users actually need.
Hopefully, even if you don't know your f-score from your Lp norm, this was a helpful read: demystifying machine learning and helping you see how it might (and might not) help you actually do the things you care about.
