---
title: "How many hamsters are needed to charge a Tesla?"
date: 2024-06-25
tags:
    - Energy
---

A friend and I were discussing the challenges of generating enough clean energy for the transition to electric vehicles.

This led us to an interesting question: could hamsters generate enough power to charge, say, a Tesla Model S with a 100kWh battery?

![](/trivia/how-many-hamsters-are-needed-to-charge-a-tesla/hamsters-charging-a-tesla.jpg)
*Obligatory AI-generated picture of our clean energy future.*

## Power output of a hamster
Let's start with the basics: how much power can a single hamster generate by running in his wheel?

This seems to be a gap in human knowledge because I couldn't find a reliable source. Some say a hamster can output 0.4W^[https://petshun.com/article/can-a-hamster-wheel-generate-electricity], while others claim 0.8W^[https://www.reddit.com/r/AskEngineers/comments/hhtx7h/comment/fwcitc2/]. 

Let's pick a conservative 0.5W.

A single hamster running in his wheel could charge our Tesla in 200,000 hours.  
`100kWh / 0,0005Wh = 200,000`

That's 22 years! We can't wait that long for a full charge. Let's throw more hamsters at the problem^[Figuratively speaking. Don't actually throw hamsters!]. 

20,000 hamsters could charge the car in 10 hours. That's way better. You come home in the evening and have hamsters running through the night to charge your car.

Obviously, a hamster can't run for that long, but let's not get bogged down by details.

## Sourcing hamsters
My next question is how we get 20,000 hamsters?

Capturing that many would be hard and time consuming. In some countries, it is even illegal because hamsters are endangered and protected by law.

Buying them sounds expensive.

So that leaves breeding!

Hamsters have a gestation period of 16-20 days and their litter size is typically 6-12 pups. They reach sexual maturity when they're 4-6 weeks old.

Let's assume our hamsters will have an average litter size of 8 pups. And let's say they can breed once every 2 months (allowing for gestation, weaning, and a short recovery period).

Starting with 100 pairs of hamsters we would get:
* First generation: 800 pups (100 pairs x 8 pups per pair)
* Second generation (2 months): 3,200 pups (400 pairs x 8 pups)
* Third generation (4 months): 12,800 pups (1,600 pairs x 8 pups)
* Fourth generation (6 months): 51,200 pups

After 6 months, we would have twice as many hamsters as we originally planned. So you could now charge two Tesla’s in 10 hours, or just one in 5 hours.

## What do hamsters eat?
Breeding hamsters is one thing, they also need to be fed.

An average hamster eats about 10 grams of grains, seeds, vegetables and fruit per day.

To keep our fury friends alive, we need 200kg of food per day.  
`10 grams x 20,000 hamsters = 200,000 grams or 200kg`

That's a lot, but manageable!

## Are they eco-friendly?
We got the hamsters, and we got the food. It's time to charge our Tesla! 

But hang on, how clean is the energy they produce? Electric vehicles are a good alternative to fossil fuels *if* you power them with clean energy.

Like all living creatures, hamsters emit greenhouse gases. An average hamster produces 0.5 grams of CO<sub>2</sub> per hour.

Our fleet of 20,000 hamsters would produce 100kg of CO<sub>2</sub> to charge the Tesla^[That works out to 1kg of CO<sub>2</sub> per kWh, nice!]. That's not taking into account the hours they spend plotting their escape, chill out or sleep.

Did we just invent a super clean source of energy?

## Hamster vs. Gas vs. Nuclear
Let's compare hamsters to gas and nuclear power stations^[Based on [this 2022 report](https://unece.org/documents/2022/08/integrated-life-cycle-assessment-electricity-sources) from United Nations Economic Commission for Europe].

A natural gas plant emits 450 grams of CO<sub>2</sub> per kWh. For 100kWh, that's 45,000 grams or 45 kg of CO<sub>2</sub>. Twice as clean as our hamsters.

Nuclear does even better with CO<sub>2</sub> emissions of 6.4 *grams* per kWh or 0,0064 kg.

![](/trivia/how-many-hamsters-are-needed-to-charge-a-tesla/hamsters-vs-gas-vs-nuclear.svg)

Clearly hamsters cannot compete with natural gas or nuclear energy...

---


## Hamster power station simulator
<script defer src="/assets/js/alpine-3.14.1.min.js"></script>

<div x-data="{ ev_battery: 100, hamster_count: 20000, hamster_power: 0.5 }">
    <div class="flex">
        <div>EV battery size:&nbsp;</div>
        <input type="range" x-model="ev_battery" min="10" max="150" step="1">
        <div>
            &nbsp;<span x-text="ev_battery"></span> kWh
        </div>
    </div>
    <div class="flex">
        <div class="pr-2">Hamster count:&nbsp;</div>
        <input type="range" x-model="hamster_count" min="100" max="50000" step="100">
        <div>
            &nbsp; <span x-text="hamster_count"></span> hamsters
        </div>
    </div>
    <div class="flex">
        <div>Hamster power output:&nbsp;</div>
        <input type="range" x-model="hamster_power" min="0.1" max="10" step="0.1">
        <div>
            &nbsp;<span x-text="hamster_power"></span> watt
        </div>
    </div>
    <br>
    <div>
        Time to fully charge EV:
        <strong>
            <span x-text="Math.round((ev_battery / (hamster_count * hamster_power / 1000) * 100)) / 100"></span>
            hours
        </strong>
        <small>(when running continuously)</small>
    </div>
</div>

---

## Conclusion
To charge your EV, hamsters are NOT the way to go.

It would be impractical to breed that many hamsters and keep them running in their wheels. It would also require a lot of infrastructure to set up their cages and capture the power from their wheels.

And even if you managed it, they would do more damage to the environment than a gas or nuclear power plant.

Did I waste an embarrassing amount of time researching an impractical solution to generate clean energy? Sure. But hey, I didn't know that going in!
